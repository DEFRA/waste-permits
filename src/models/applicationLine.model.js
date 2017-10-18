'use strict'

const Constants = require('../constants')
const LoggingService = require('../services/logging.service')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')

module.exports = class ApplicationLine extends BaseModel {
  constructor (applicationLine) {
    super()
    this.applicationId = applicationLine.applicationId
    this.standardRuleId = applicationLine.standardRuleId
  }

  async save (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    const dataObject = {
      'defra_applicationId@odata.bind': `defra_applications(${this.applicationId})`,
      'defra_standardruleId@odata.bind': `defra_standardrules(${this.standardRuleId})`,
      defra_permittype: Constants.Dynamics.PermitTypes.STANDARD
    }

    try {
      let query
      if (this.isNew()) {
        // New application line
        query = 'defra_applicationlines'
        this.id = await dynamicsDal.create(query, dataObject)
        LoggingService.logInfo(`Created Application Line with ID: ${this.id}`)
      }
    } catch (error) {
      LoggingService.logError(`Unable to save Application Line: ${error}`)
      throw error
    }
  }
}
