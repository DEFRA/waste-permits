'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const Application = require('./application.model')
const LoggingService = require('../services/logging.service')
const Utilities = require('../utilities/utilities')

module.exports = class Account extends BaseModel {
  constructor (account) {
    super()
    if (account) {
      this.id = account.id
      this.companyNumber = account.companyNumber
      this.companyName = account.companyName
      this.tradingName = account.tradingName
      this.IsValidatedWithCompaniesHouse = account.IsValidatedWithCompaniesHouse
    }
  }

  static async getByApplicationId (authToken, applicationId) {
    let account
    const dynamicsDal = new DynamicsDalService(authToken)
    const application = await Application.getById(authToken, applicationId)
    if (application.accountId) {
      try {
        const query = encodeURI(`accounts(${application.accountId})?$select=defra_companyhouseid,name,defra_tradingname`)
        const result = await dynamicsDal.search(query)
        if (result) {
          account = new Account({
            id: application.accountId,
            companyNumber: Utilities.replaceNull(result.defra_companyhouseid),
            companyName: Utilities.replaceNull(result.name),
            tradingName: Utilities.replaceNull(result.defra_tradingname)
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
    const dynamicsDal = new DynamicsDalService(authToken)

    // Update the Account
    try {
      // Map the Account to the corresponding Dynamics schema Account object
      const dataObject = {
        defra_companyhouseid: this.companyNumber.toUpperCase(),
        name: this.companyName,
        defra_tradingname: this.tradingName,
        defra_draft: isDraft,
        defra_validatedwithcompanyhouse: this.IsValidatedWithCompaniesHouse
      }

      let query
      if (this.isNew()) {
        // New Account
        query = 'accounts'
        this.id = await dynamicsDal.create(query, dataObject)
      } else {
        // Update Account
        query = `accounts(${this.id})`
        await dynamicsDal.update(query, dataObject)
      }
    } catch (error) {
      LoggingService.logError(`Unable to save Account: ${error}`)
      throw error
    }
  }
}
