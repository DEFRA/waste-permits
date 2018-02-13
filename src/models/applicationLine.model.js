'use strict'

const Constants = require('../constants')
const {RulesetIds} = Constants.Dynamics
const LoggingService = require('../services/logging.service')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')

module.exports = class ApplicationLine extends BaseModel {
  static mapping () {
    return [
      {field: 'applicationId', dynamics: '_defra_applicationid_value', bind: {id: 'defra_applicationId', entity: 'defra_applications'}},
      {field: 'standardRuleId', dynamics: '_defra_standardruleid_value', bind: {id: 'defra_standardruleId', entity: 'defra_standardrules'}},
      {field: 'parametersId', dynamics: '_defra_parametersid_value'},
      {field: 'permitType', dynamics: 'defra_permittype', constant: Constants.Dynamics.PermitTypes.STANDARD}
    ]
  }

  constructor (...args) {
    super(...args)
    this._entity = 'defra_applicationlines'
  }

  static async getById (authToken, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const query = encodeURI(`defra_applicationlines(${applicationLineId})`)
    try {
      const result = await dynamicsDal.search(query)
      const applicationLine = ApplicationLine.dynamicsToModel(result)
      applicationLine.id = applicationLineId
      return applicationLine
    } catch (error) {
      LoggingService.logError(`Unable to get ApplicationLine by Id: ${error}`)
      throw error
    }
  }

  static async getValidRulesetIds (authToken, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const rulesetIds = Object.keys(RulesetIds).map((prop) => RulesetIds[prop])
    const query = encodeURI(`defra_applicationlines(${applicationLineId})?$expand=defra_parametersId($select=${rulesetIds.join()})`)
    let validRuleIds = []
    try {
      const result = await dynamicsDal.search(query)
      if (result && result.defra_parametersId) {
        // return only those rulesetIds with a value of true
        validRuleIds = rulesetIds.filter((rulesetId) => result.defra_parametersId[rulesetId])
      }
    } catch (error) {
      LoggingService.logError(`Unable to get RulesetId list by applicationLineId: ${error}`)
      throw error
    }
    return validRuleIds
  }

  async save (authToken) {
    const dataObject = this.modelToDynamics()
    await super.save(authToken, dataObject)
  }
}
