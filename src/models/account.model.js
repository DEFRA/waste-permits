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

  static async getByApplicationId (authToken, applicationId) {
    let account
    const dynamicsDal = new DynamicsDalService(authToken)
    const application = await Application.getById(authToken, applicationId)
    if (application.accountId) {
      try {
        const query = encodeURI(`accounts(${application.accountId})?$select=defra_companyhouseid,name,defra_draft`)
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
}
