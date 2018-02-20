'use strict'

const Constants = require('../constants')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

class Application extends BaseModel {
  static get entity () {
    return 'defra_applications'
  }

  static get mapping () {
    return [
      {field: 'applicationNumber', dynamics: 'defra_applicationnumber'},
      {field: 'accountId', dynamics: '_defra_customerid_value', bind: {id: 'defra_customerid_account', relationship: 'defra_account_defra_application_customerid', entity: 'accounts'}},
      {field: 'contactId', dynamics: '_defra_primarycontactid_value', bind: {id: 'defra_primarycontactid', relationship: 'defra_contact_defra_application_primarycontactid', entity: 'contacts'}},
      {field: 'agentId', dynamics: '_defra_agentid_value', bind: {id: 'defra_agentid_account', relationship: 'defra_account_defra_application_agentid', entity: 'accounts'}},
      {field: 'tradingName', dynamics: 'defra_tradingname', length: {max: 170}},
      {field: 'applicationName', dynamics: 'defra_name', readOnly: true},
      {field: 'technicalQualification', dynamics: 'defra_technicalability'},
      {field: 'relevantOffences', dynamics: 'defra_convictionsdeclaration'},
      {field: 'relevantOffencesDetails', dynamics: 'defra_convictionsdeclarationdetails', length: {max: 2000}},
      {field: 'bankruptcy', dynamics: 'defra_bankruptcydeclaration'},
      {field: 'bankruptcyDetails', dynamics: 'defra_bankruptcydeclarationdetails', length: {max: 2000}},
      {field: 'confidentiality', dynamics: 'defra_confidentialitydeclaration'},
      {field: 'confidentialityDetails', dynamics: 'defra_confidentialitydeclarationdetails', length: {max: 2000}},
      {field: 'declaration', dynamics: 'defra_applicationdeclaration'},
      {field: 'regime', dynamics: 'defra_regime', constant: Constants.Dynamics.WASTE_REGIME},
      {field: 'source', dynamics: 'defra_source', constant: Constants.Dynamics.DIGITAL_SOURCE},
      {field: 'statuscode', dynamics: 'statuscode', constant: Constants.Dynamics.StatusCode.DRAFT}
    ]
  }

  constructor (...args) {
    super(...args)
    const declaration = {args}
    this.declaration = !!declaration // Make declaration a boolean
  }

  static async getById (authToken, applicationId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const query = encodeURI(`defra_applications(${applicationId})?$select=${Application.selectedDynamicsFields()}`)
    try {
      const result = await dynamicsDal.search(query)
      const application = Application.dynamicsToModel(result)
      application.id = applicationId
      return application
    } catch (error) {
      LoggingService.logError(`Unable to get Application by applicationId: ${error}`)
      throw error
    }
  }

  async save (authToken) {
    const dataObject = this.modelToDynamics()
    const isNew = this.isNew()
    await super.save(authToken, dataObject)
    if (isNew) {
      LoggingService.logInfo(`Created application with ID: ${this.id}`)
    }
  }
}

Application.setDefinitions()

module.exports = Application
