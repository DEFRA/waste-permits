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
      {field: 'id', dynamics: 'accountid', relationship: 'defra_parent_child_account_relationship'},
      {field: 'companyNumber', dynamics: 'defra_companyhouseid', encode: true, length: {max: 8, min: 8}},
      {field: 'accountName', dynamics: 'name', length: {max: 160}},
      {field: 'organisationType', dynamics: 'defra_organisation_type'},
      {field: 'isDraft', dynamics: 'defra_draft'},
      {field: 'isValidatedWithCompaniesHouse', dynamics: 'defra_validatedwithcompanyhouse'}
    ]
  }

  static async getByApplicationId (context, applicationId) {
    const application = await Application.getById(context, applicationId)
    if (application && application.permitHolderOrganisationId) {
      return Account.getById(context, application.permitHolderOrganisationId)
    }
  }

  static async getByCompanyNumber (context, companyNumber) {
    return super.getBy(context, {companyNumber})
  }

  async save (context, isDraft) {
    const dataObject = this.modelToDynamics()
    dataObject.defra_companyhouseid = dataObject.defra_companyhouseid ? Utilities.stripWhitespace(dataObject.defra_companyhouseid).toUpperCase() : undefined
    dataObject.defra_draft = isDraft
    await super.save(context, dataObject)
  }

  async confirm (context) {
    const dynamicsDal = new DynamicsDalService(context.authToken)
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
