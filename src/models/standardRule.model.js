'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const ApplicationLine = require('./applicationLine.model')
const LoggingService = require('../services/logging.service')

class StandardRule extends BaseModel {
  static get entity () {
    return 'defra_standardrules'
  }

  static get readOnly () {
    return true
  }

  static get mapping () {
    return [
      {field: 'id', dynamics: 'defra_standardruleid'},
      {field: 'standardRuleTypeId', dynamics: '_defra_standardruletypeid_value'},
      {field: 'permitName', dynamics: 'defra_rulesnamegovuk'},
      {field: 'limits', dynamics: 'defra_limits'},
      {field: 'code', dynamics: 'defra_code', encode: true},
      {field: 'wamitabRiskLevel', dynamics: 'defra_wamitabrisklevel'},
      {field: 'guidanceUrl', dynamics: 'defra_guidanceurl'},
      {field: 'canApplyFor', dynamics: 'defra_canapplyfor'},
      {field: 'canApplyOnline', dynamics: 'defra_canapplyonline'}
    ]
  }

  constructor (...args) {
    super(...args)
    const [standardRule] = args
    this.codeForId = StandardRule.transformPermitCode(standardRule.code)
  }

  static async getByCode (context, code) {
    return super.getBy(context, {code})
  }

  static async getByApplicationLineId (context, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(context.authToken)

    try {
      const {standardRuleId} = await ApplicationLine.getById(context, applicationLineId)
      const query = encodeURI(`defra_standardrules(${standardRuleId})?$select=${StandardRule.selectedDynamicsFields()}`)
      const result = await dynamicsDal.search(query)
      return StandardRule.dynamicsToModel(result)
    } catch (error) {
      LoggingService.logError(`Unable to get StandardRule by ApplicationLine ID: ${error}`)
      throw error
    }
  }

  static async list (context, standardRuleTypeId) {
    const dynamicsDal = new DynamicsDalService(context.authToken)

    let filter =
      // Must be open for applications
      `defra_canapplyfor eq true`

    if (standardRuleTypeId) {
      filter += ` and _defra_standardruletypeid_value eq ${standardRuleTypeId}`
    }

    const query = encodeURI(`defra_standardrules?$select=${StandardRule.selectedDynamicsFields()}${filter ? `&$filter=${filter}` : ''}&$orderby=defra_nameinrulesetdocument asc`)
    try {
      const response = await dynamicsDal.search(query)

      // Parse response into Standard Rule objects
      return response.value.map((standardRule) => StandardRule.dynamicsToModel(standardRule))
    } catch (error) {
      LoggingService.logError(`Unable to list StandardRules: ${error}`)
      throw error
    }
  }

  // Transform the code into kebab-case for ID
  static transformPermitCode (code) {
    return code.replace(/\s+/g, '-').toLowerCase()
  }
}

StandardRule.setDefinitions()

module.exports = StandardRule
