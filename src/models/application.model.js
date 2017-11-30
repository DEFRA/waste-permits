'use strict'

const Constants = require('../constants')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
const Utilities = require('../utilities/utilities')

module.exports = class Application extends BaseModel {
  constructor (application) {
    super()
    this.entity = 'defra_applications'
    if (application) {
      this.accountId = application.accountId
      this.tradingName = application.tradingName
      this.relevantOffences = application.relevantOffences
      this.relevantOffencesDetails = application.relevantOffencesDetails
      this.bankruptcy = application.bankruptcy
      this.bankruptcyDetails = application.bankruptcyDetails

      // The following delay is required by the untilComplete method
      this.delay = 250
    }
    Utilities.convertFromDynamics(this)
  }

  static async getById (authToken, applicationId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const selectedFields = [
      '_defra_customerid_value',
      'defra_tradingname',
      'defra_convictionsdeclaration',
      'defra_convictionsdeclarationdetails',
      'defra_bankruptcydeclaration',
      'defra_bankruptcydeclarationdetails'
    ].join(',')
    const query = encodeURI(`defra_applications(${applicationId})?$select=${selectedFields}`)
    try {
      const result = await dynamicsDal.search(query)
      const application = new Application({
        accountId: result._defra_customerid_value,
        tradingName: result.defra_tradingname,
        relevantOffences: result.defra_convictionsdeclaration,
        relevantOffencesDetails: result.defra_convictionsdeclarationdetails,
        bankruptcy: result.defra_bankruptcydeclaration,
        bankruptcyDetails: result.defra_bankruptcydeclarationdetails
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
    const dataObject = {
      defra_regime: Constants.Dynamics.WASTE_REGIME,
      defra_source: Constants.Dynamics.DIGITAL_SOURCE,
      defra_tradingname: this.tradingName,
      defra_convictionsdeclaration: this.relevantOffences,
      defra_convictionsdeclarationdetails: this.relevantOffencesDetails,
      defra_bankruptcydeclaration: this.bankruptcy,
      defra_bankruptcydeclarationdetails: this.bankruptcyDetails
    }
    const isNew = this.isNew()
    if (!isNew && this.accountId) {
      dataObject['defra_customerid_account@odata.bind'] = `accounts(${this.accountId})`
    }
    await super.save(authToken, dataObject)

    // The following "untilComplete" can be removed when the update is successful only when the update in dynamics has fully completed.
    await this.untilComplete(authToken)
    if (isNew) {
      LoggingService.logInfo(`Created application with ID: ${this.id}`)
    }
  }
}
