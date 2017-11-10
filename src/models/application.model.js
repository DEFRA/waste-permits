'use strict'

const Constants = require('../constants')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
const Utilities = require('../utilities/utilities')

module.exports = class Application extends BaseModel {
  constructor (application) {
    super()
    if (application) {
      this.accountId = application.accountId
      // The following delay is required by the untilComplete method
      this.delay = 250
    }
  }

  static async getById (authToken, applicationId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const query = encodeURI(`defra_applications(${applicationId})?$select=_defra_customerid_value`)
    try {
      const result = await dynamicsDal.search(query)
      const application = new Application({
        accountId: Utilities.replaceNull(result._defra_customerid_value)
      })
      application.id = applicationId
      return application
    } catch (error) {
      LoggingService.logError(`Unable to get Application by applicationId: ${error}`)
      throw error
    }
  }

  // A bug currently exists where the account id isn't updated straight away in dynamics even when the save is successful.
  // This function is a temporary fix to wait until we are sure we can get the account id.
  // This and the code overriding the delay property in the test, can be removed when the update is successful only when the update in dynamics has fully completed.
  async untilComplete (authToken) {
    for (let retries = 10; retries && !(await Application.getById(authToken, this.id)).accountId; retries--) {
      if (!retries) {
        throw new Error('Failed to complete')
      }
      await new Promise(resolve => setTimeout(resolve, this.delay))
    }
  }

  async save (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    const dataObject = {
      defra_regime: Constants.Dynamics.WASTE_REGIME,
      defra_source: Constants.Dynamics.DIGITAL_SOURCE
    }

    try {
      let query
      if (this.isNew()) {
        // New application
        query = 'defra_applications'
        this.id = await dynamicsDal.create(query, dataObject)
        LoggingService.logInfo(`Created application with ID: ${this.id}`)
      } else {
        // Update Account
        query = `defra_applications(${this.id})`
        await dynamicsDal.update(query, {
          'defra_customerid_account@odata.bind': `accounts(${this.accountId})`
        })
        // The following "untilComplete" can be removed when the update is successful only when the update in dynamics has fully completed.
        await this.untilComplete(authToken)
      }
    } catch (error) {
      LoggingService.logError(`Unable to save Application: ${error}`)
      throw error
    }
  }
}
