'use strict'

const Constants = require('../../constants')
const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const LoggingService = require('../../services/logging.service')
const Account = require('../account.model')
const ApplicationLine = require('../applicationLine.model')

module.exports = class CompanyDetails extends BaseModel {
  constructor (data) {
    super()
    this.applicationLineId = data.applicationLineId
  }

  static async updateCompleteness (authToken, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)

    try {
      const applicationLine = await ApplicationLine.getById(authToken, applicationLineId)
      const isComplete = await CompanyDetails._isComplete(authToken, applicationId)

      const entity = {
        [Constants.Dynamics.CompletedParamters.PERMIT_HOLDER_DETAILS]: isComplete
      }
      const query = `defra_wasteparamses(${applicationLine.parametersId})`
      await dynamicsDal.update(query, entity)
    } catch (error) {
      LoggingService.logError(`Unable to update CompanyDetails completeness: ${error}`)
      throw error
    }
  }

  static async _isComplete (authToken, applicationId) {
    let isComplete = false
    try {
      // Get the Account for this application
      const account = await Account.getByApplicationId(authToken, applicationId)

      if (account.accountName) {
        isComplete =
          account.accountName !== undefined && account.accountName.length > 0
      }
    } catch (error) {
      LoggingService.logError(`Unable to calculate CompanyDetails completeness: ${error}`)
      throw error
    }
    return isComplete
  }
}
