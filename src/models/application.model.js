'use strict'

const Constants = require('../constants')
const LoggingService = require('../services/logging.service')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')

module.exports = class Application extends BaseModel {
  constructor (application) {
    super()
    if (application) {
      this.accountId = application.accountId
    }
  }

  static async getById (authToken, applicationId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const query = encodeURI(`defra_applications(${applicationId})?$select=_defra_customerid_value`)
    try {
      const result = await dynamicsDal.search(query)
      const application = new Application({
        accountId: result._defra_customerid_value
      })
      application.id = applicationId
      return application
    } catch (error) {
      LoggingService.logError(`Unable to get Application by applicationId: ${error}`)
      throw error
    }
  }

  async save (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    const dataObject = {
      defra_regime: Constants.Dynamics.WASTE_REGIME,
      defra_source: Constants.Dynamics.DIGITAL_SOURCE,
      'defra_customerid@odata.bind': `defra_accounts(${this.accountId})`
    }

    try {
      let query
      if (this.isNew()) {
        // New application
        query = 'defra_applications'
        this.id = await dynamicsDal.create(query, dataObject)
        LoggingService.logInfo(`Created application with ID: ${this.id}`)
      }
    } catch (error) {
      LoggingService.logError(`Unable to save Application: ${error}`)
      throw error
    }
  }
}
