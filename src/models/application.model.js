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
      this.technicalQualification = application.technicalQualification
      this.relevantOffences = application.relevantOffences
      this.relevantOffencesDetails = application.relevantOffencesDetails
      this.bankruptcy = application.bankruptcy
      this.bankruptcyDetails = application.bankruptcyDetails
      this.confidentiality = application.confidentiality
      this.confidentialityDetails = application.confidentialityDetails
    }
    Utilities.convertFromDynamics(this)
  }

  static selectedDynamicsFields () {
    return [
      '_defra_customerid_value',
      'defra_tradingname',
      'defra_technicalability',
      'defra_convictionsdeclaration',
      'defra_convictionsdeclarationdetails',
      'defra_bankruptcydeclaration',
      'defra_bankruptcydeclarationdetails',
      'defra_confidentialitydeclaration',
      'defra_confidentialitydeclarationdetails'
    ]
  }

  static async getById (authToken, applicationId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const query = encodeURI(`defra_applications(${applicationId})?$select=${Application.selectedDynamicsFields()}`)
    try {
      const result = await dynamicsDal.search(query)
      const application = new Application({
        accountId: result._defra_customerid_value,
        tradingName: result.defra_tradingname,
        technicalQualification: result.defra_technicalability,
        relevantOffences: result.defra_convictionsdeclaration,
        relevantOffencesDetails: result.defra_convictionsdeclarationdetails,
        bankruptcy: result.defra_bankruptcydeclaration,
        bankruptcyDetails: result.defra_bankruptcydeclarationdetails,
        confidentiality: result.defra_confidentialitydeclaration,
        confidentialityDetails: result.defra_confidentialitydeclarationdetails
      })
      application.id = applicationId
      return application
    } catch (error) {
      LoggingService.logError(`Unable to get Application by applicationId: ${error}`)
      throw error
    }
  }

  async save (authToken) {
    const dataObject = {
      defra_regime: Constants.Dynamics.WASTE_REGIME,
      defra_source: Constants.Dynamics.DIGITAL_SOURCE,
      defra_tradingname: this.tradingName,
      defra_technicalability: this.technicalQualification,
      defra_convictionsdeclaration: this.relevantOffences,
      defra_convictionsdeclarationdetails: this.relevantOffencesDetails,
      defra_bankruptcydeclaration: this.bankruptcy,
      defra_bankruptcydeclarationdetails: this.bankruptcyDetails,
      defra_confidentialitydeclaration: this.confidentiality,
      defra_confidentialitydeclarationdetails: this.confidentialityDetails
    }
    const isNew = this.isNew()
    if (isNew) {
      dataObject.statuscode = Constants.Dynamics.StatusCode.DRAFT // Set the status of the new application to draft
    } else if (this.accountId) {
      dataObject['defra_customerid_account@odata.bind'] = `accounts(${this.accountId})`
    }
    await super.save(authToken, dataObject)
    if (isNew) {
      LoggingService.logInfo(`Created application with ID: ${this.id}`)
    }
  }
}
