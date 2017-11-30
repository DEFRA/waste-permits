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
      this.tradingName = application.tradingName
      this.relevantOffences = application.relevantOffences
      this.relevantOffencesDetails = application.relevantOffencesDetails
      this.bankruptcy = application.bankruptcy
      this.bankruptcyDetails = application.bankruptcyDetails
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

  async save (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    const dataObject = {
      defra_regime: Constants.Dynamics.WASTE_REGIME,
      defra_source: Constants.Dynamics.DIGITAL_SOURCE,
      defra_tradingname: this.tradingName,
      defra_convictionsdeclaration: this.relevantOffences,
      defra_convictionsdeclarationdetails: this.relevantOffencesDetails,
      defra_bankruptcydeclaration: this.bankruptcy,
      defra_bankruptcydeclarationdetails: this.bankruptcyDetails
    }

    try {
      let query
      if (this.isNew()) {
        // New Application
        query = 'defra_applications'
        this.id = await dynamicsDal.create(query, dataObject)
        LoggingService.logInfo(`Created application with ID: ${this.id}`)
      } else {
        // Update Application
        query = `defra_applications(${this.id})`
        if (this.accountId) {
          dataObject['defra_customerid_account@odata.bind'] = `accounts(${this.accountId})`
        }
        await dynamicsDal.update(query, dataObject)
      }
    } catch (error) {
      LoggingService.logError(`Unable to save Application: ${error}`)
      throw error
    }
  }
}
