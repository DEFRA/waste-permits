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
      {field: 'accountId', dynamics: '_defra_customerid_value', bind: {id: 'defra_customerid_account', relationship: 'defra_account_defra_application_customerid', entity: 'accounts'}},
      {field: 'agentId', dynamics: '_defra_agentid_value', bind: {id: 'defra_agentid_account', relationship: 'defra_account_defra_application_agentid', entity: 'accounts'}},
      {field: 'applicationName', dynamics: 'defra_name', readOnly: true},
      {field: 'applicationNumber', dynamics: 'defra_applicationnumber'},
      {field: 'bankruptcy', dynamics: 'defra_bankruptcydeclaration'},
      {field: 'bankruptcyDetails', dynamics: 'defra_bankruptcydeclarationdetails', length: {max: 2000}},
      {field: 'confidentiality', dynamics: 'defra_confidentialitydeclaration'},
      {field: 'confidentialityDetails', dynamics: 'defra_confidentialitydeclarationdetails', length: {max: 2000}},
      {field: 'contactId', dynamics: '_defra_primarycontactid_value', bind: {id: 'defra_primarycontactid', relationship: 'defra_contact_defra_application_primarycontactid', entity: 'contacts'}},
      {field: 'declaration', dynamics: 'defra_applicationdeclaration'},
      {field: 'paymentReceived', dynamics: 'defra_paymentreceived'},
      {field: 'regime', dynamics: 'defra_regime', constant: Constants.Dynamics.WASTE_REGIME},
      {field: 'relevantOffences', dynamics: 'defra_convictionsdeclaration'},
      {field: 'relevantOffencesDetails', dynamics: 'defra_convictionsdeclarationdetails', length: {max: 2000}},
      {field: 'source', dynamics: 'defra_source', constant: Constants.Dynamics.DIGITAL_SOURCE},
      {field: 'statusCode', dynamics: 'statuscode'},
      {field: 'technicalQualification', dynamics: 'defra_technicalability'},
      {field: 'tradingName', dynamics: 'defra_tradingname', length: {max: 170}},
      {field: 'saveAndReturnEmail', dynamics: 'defra_saveandreturnemail', length: {max: 100}}
    ]
  }

  constructor (...args) {
    super(...args)
    const declaration = {args}
    this.declaration = Boolean(declaration)
  }

  isSubmitted () {
    return this.statusCode && (this.statusCode === Constants.Dynamics.StatusCode.APPLICATION_RECEIVED)
  }

  isPaid () {
    return Boolean(this.paymentReceived)
  }

  async confirm (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const actionDataObject = {
      saveAndReturnUrl: Constants.SAVE_AND_RETURN_URL
    }
    try {
      // Call Dynamics save and return email action
      let action = `${this.constructor.entity}(${this.id})/Microsoft.Dynamics.CRM.defra_saveandreturnemail`
      await dynamicsDal.callAction(action, actionDataObject)
    } catch (error) {
      LoggingService.logError(`Unable to call Dynamics Save and Return action: ${error}`)
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
