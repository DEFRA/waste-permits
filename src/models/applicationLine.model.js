'use strict'

const Constants = require('../constants')
const LoggingService = require('../services/logging.service')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const Utilities = require('../utilities/utilities')

module.exports = class ApplicationLine extends BaseModel {
  constructor (applicationLine) {
    super()
    this.entity = 'defra_applicationlines'
    if (applicationLine) {
      this.applicationId = applicationLine.applicationId
      this.standardRuleId = applicationLine.standardRuleId
      this.parametersId = applicationLine.parametersId
    }
    Utilities.convertFromDynamics(this)
  }

  static async getById (authToken, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const query = encodeURI(`defra_applicationlines(${applicationLineId})`)
    try {
      const result = await dynamicsDal.search(query)
      const applicationLine = new ApplicationLine({
        applicationId: result._defra_applicationid_value,
        standardRuleId: result._defra_standardruleid_value,
        parametersId: result._defra_parametersid_value
      })
      applicationLine.id = applicationLineId
      return applicationLine
    } catch (error) {
      LoggingService.logError(`Unable to get ApplicationLine by applicationLineId: ${error}`)
      throw error
    }
  }

  async save (authToken) {
    const dataObject = {
      'defra_applicationId@odata.bind': `defra_applications(${this.applicationId})`,
      'defra_standardruleId@odata.bind': `defra_standardrules(${this.standardRuleId})`,
      defra_permittype: Constants.Dynamics.PermitTypes.STANDARD
    }
    await super.save(authToken, dataObject)
  }
}
