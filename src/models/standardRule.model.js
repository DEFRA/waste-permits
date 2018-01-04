'use strict'

const Constants = require('../constants')

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const ApplicationLine = require('./applicationLine.model')
const LoggingService = require('../services/logging.service')
const Utilities = require('../utilities/utilities')

module.exports = class StandardRule extends BaseModel {
  constructor (standardRule) {
    super()
    if (standardRule) {
      this.id = standardRule.id
      this.name = standardRule.name
      this.limits = standardRule.limits
      this.code = standardRule.code
      this.codeForId = StandardRule.transformPermitCode(standardRule.code)
      this.guidanceUrl = standardRule.guidanceUrl
    }
    Utilities.convertFromDynamics(this)
  }

  static getDynamicsData (result) {
    return {
      id: result.defra_standardruleid,
      name: result.defra_rulesnamegovuk,
      limits: result.defra_limits,
      code: result.defra_code,
      guidanceUrl: result.defra_guidanceurl
    }
  }

  static selectedDynamicsFields () {
    return [
      'defra_standardruleid',
      'defra_rulesnamegovuk',
      'defra_limits',
      'defra_code',
      'defra_guidanceurl'
    ]
  }

  // Map the allowed permits into a Dynamics filter that will retrieve the standard rules
  static getAllowedPermitFilter () {
    return Constants.ALLOWED_PERMITS
      .map(permit => `defra_code eq '${permit}'`)
      .join(' or ')
  }

  static async getByCode (authToken, code) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const filter = `defra_code eq '${code}'`
    const query = encodeURI(`defra_standardrules?$select=${StandardRule.selectedDynamicsFields()}&$filter=${filter}`)

    try {
      const response = await dynamicsDal.search(query)
      const result = response.value[0]
      return new StandardRule(result ? StandardRule.getDynamicsData(result) : undefined)
    } catch (error) {
      LoggingService.logError(`Unable to get StandardRule by code: ${error}`)
      throw error
    }
  }

  static async getByApplicationLineId (authToken, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)

    try {
      const {standardRuleId} = await ApplicationLine.getById(authToken, applicationLineId)
      const query = encodeURI(`defra_standardrules(${standardRuleId})?$select=${StandardRule.selectedDynamicsFields()}`)
      const result = await dynamicsDal.search(query)
      return new StandardRule(result ? StandardRule.getDynamicsData(result) : undefined)
    } catch (error) {
      LoggingService.logError(`Unable to get StandardRule by ApplicationLine ID: ${error}`)
      throw error
    }
  }

  static async list (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    const filter =
      // Must be open for applications
      `defra_canapplyfor eq true` +

      // Must be one of the allowed permit types
      ` and (${this.getAllowedPermitFilter()})`

    const query = encodeURI(`defra_standardrules?$select=${StandardRule.selectedDynamicsFields()}&$filter=${filter}&$orderby=defra_nameinrulesetdocument asc`)
    try {
      const response = await dynamicsDal.search(query)

      // Parse response into Standard Rule objects
      return response.value.map((standardRule) => new StandardRule(StandardRule.getDynamicsData(standardRule)))
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
