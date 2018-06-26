'use strict'

const {RulesetIds, PermitTypes} = require('../dynamics')
const LoggingService = require('../services/logging.service')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')

class ApplicationLine extends BaseModel {
  static get entity () {
    return 'defra_applicationlines'
  }

  static get mapping () {
    return [
      {field: 'id', dynamics: 'defra_applicationlineid', readOnly: true},
      {field: 'applicationId', dynamics: '_defra_applicationid_value', bind: {id: 'defra_applicationId', entity: 'defra_applications'}},
      {field: 'standardRuleId', dynamics: '_defra_standardruleid_value', bind: {id: 'defra_standardruleId', entity: 'defra_standardrules'}},
      {field: 'parametersId', dynamics: '_defra_parametersid_value', readOnly: true},
      {field: 'value', dynamics: 'defra_value', readOnly: true},
      {field: 'permitType', dynamics: 'defra_permittype', constant: PermitTypes.STANDARD}
    ]
  }

  static async getByApplicationId (context, applicationId) {
    return super.getBy(context, {applicationId})
  }

  static async getValidRulesetIds (context, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(context.authToken)
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

  static async getCompleted (context, applicationLineId, completedId) {
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const query = encodeURI(`defra_applicationlines(${applicationLineId})?$expand=defra_parametersId($select=${completedId})`)
    let completed
    try {
      const result = await dynamicsDal.search(query)

      if (result && result.defra_parametersId) {
        completed = result.defra_parametersId[completedId]
      }
    } catch (error) {
      LoggingService.logError(`Unable to get completed by ${completedId}: ${error}`)
      throw error
    }
    return completed
  }

  async save (context) {
    const dataObject = this.modelToDynamics()
    await super.save(context, dataObject)
  }
}

ApplicationLine.setDefinitions()

module.exports = ApplicationLine
