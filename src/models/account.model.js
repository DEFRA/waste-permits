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
    }
  }

  static async getByApplicationId (authToken, applicationId) {
    let account
    const dynamicsDal = new DynamicsDalService(authToken)
    const application = await Application.getById(authToken, applicationId)
    if (application.accountId) {
      try {
        const filter = `accountid eq ${application.accountId}`
        const query = encodeURI(`accounts?$select=defra_companyhouseid&$filter=${filter}`)
        const result = await dynamicsDal.search(query)
        if (result) {
          account = new Account({
            id: application.accountId,
            companyNumber: Utilities.replaceNull(result.defra_companyhouseid)
          })
        }
      } catch (error) {
        LoggingService.logError(`Unable to get Account by application ID: ${error}`)
        throw error
      }
    }
    return account
  }

  async save (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    // Update the Account
    try {
      // Map the Account to the corresponding Dynamics schema Account object
      const dataObject = {
        defra_companyhouseid: this.companyNumber
      }
      let query
      if (this.isNew()) {
        // New Account,
        dataObject.defra_draft = true
        dataObject.defra_validatedwithcompanyhouse = false
        query = 'defra_accounts'
        this.id = await dynamicsDal.create(query, dataObject)
      } else {
        // Update Account
        query = `defra_accounts(${this.id})`
        await dynamicsDal.update(query, dataObject)
      }
    } catch (error) {
      LoggingService.logError(`Unable to save Account: ${error}`)
      throw error
    }
  }
}
