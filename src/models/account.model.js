'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const Application = require('./application.model')
const LoggingService = require('../services/logging.service')
const Utilities = require('../utilities/utilities')

class Account extends BaseModel {
  static get entity () {
    return 'accounts'
  }

  static get mapping () {
    return [
      {field: 'id', dynamics: 'accountid'},
      {field: 'companyNumber', dynamics: 'defra_companyhouseid', length: {max: 8, min: 8}},
      {field: 'accountName', dynamics: 'name', length: {max: 160}},
      {field: 'isDraft', dynamics: 'defra_draft'},
      {field: 'isValidatedWithCompaniesHouse', dynamics: 'defra_validatedwithcompanyhouse'}
    ]
  }

  static async getByApplicationId (authToken, applicationId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const application = await Application.getById(authToken, applicationId)
    if (application && application.accountId) {
      try {
        const query = encodeURI(`accounts(${application.accountId})?$select=${Account.selectedDynamicsFields()}`)
        const result = await dynamicsDal.search(query)
        return Account.dynamicsToModel(result)
      } catch (error) {
        LoggingService.logError(`Unable to get Account by application ID: ${error}`)
        throw error
      }
    }
  }

  static async getByCompanyNumber (authToken, companyNumber) {
    const dynamicsDal = new DynamicsDalService(authToken)
    try {
      const filter = `defra_companyhouseid eq '${companyNumber}'`
      const query = encodeURI(`accounts?$select=${Account.selectedDynamicsFields()}&$filter=${filter}`)
      let result = await dynamicsDal.search(query)

      if (result && result.value) {
        return Account.dynamicsToModel(result.value.pop() || [])
      }
    } catch (error) {
      LoggingService.logError(`Unable to get Account by application ID: ${error}`)
      throw error
    }
  }

  async save (authToken, isDraft) {
    const dataObject = this.modelToDynamics()
    dataObject.defra_companyhouseid = dataObject.defra_companyhouseid ? Utilities.stripWhitespace(dataObject.defra_companyhouseid).toUpperCase() : undefined
    dataObject.defra_draft = isDraft
    await super.save(authToken, dataObject)
  }

  async confirm (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const actionDataObject = {
      CompanyRegistrationNumber: this.companyNumber
    }
    try {
      // Call Dynamics Companies House action
      let action = `accounts(${this.id})/Microsoft.Dynamics.CRM.defra_companieshousevalidation`
      await dynamicsDal.callAction(action, actionDataObject)
    } catch (error) {
      LoggingService.logError(`Unable to call Dynamics Companies House action: ${error}`)
      throw error
    }
  }
}

Account.setDefinitions()

module.exports = Account
