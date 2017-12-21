'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const Application = require('./application.model')
const LoggingService = require('../services/logging.service')
const Utilities = require('../utilities/utilities')

module.exports = class Account extends BaseModel {
  constructor (account) {
    super()
    this.entity = 'accounts'
    if (account) {
      this.id = account.id
      this.companyNumber = account.companyNumber
      this.name = account.name
      this.isDraft = account.isDraft
      this.isValidatedWithCompaniesHouse = account.isValidatedWithCompaniesHouse
    }
    Utilities.convertFromDynamics(this)
  }

  static selectedDynamicsFields () {
    return [
      'defra_companyhouseid',
      'name',
      'defra_draft'
    ]
  }

  static async getByApplicationId (authToken, applicationId) {
    let account
    const dynamicsDal = new DynamicsDalService(authToken)
    const application = await Application.getById(authToken, applicationId)
    if (application.accountId) {
      try {
        const query = encodeURI(`accounts(${application.accountId})?$select=${Account.selectedDynamicsFields()}`)
        const result = await dynamicsDal.search(query)
        if (result) {
          account = new Account({
            id: application.accountId,
            companyNumber: result.defra_companyhouseid,
            name: result.name,
            isDraft: result.defra_draft
          })
        }
      } catch (error) {
        LoggingService.logError(`Unable to get Account by application ID: ${error}`)
        throw error
      }
    }
    return account
  }

  async save (authToken, isDraft) {
    const dataObject = {
      defra_companyhouseid: Utilities.stripWhitespace(this.companyNumber).toUpperCase(),
      name: this.name,
      defra_draft: isDraft,
      defra_validatedwithcompanyhouse: this.isValidatedWithCompaniesHouse
    }
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
