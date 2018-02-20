'use strict'

const Constants = require('../constants')

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const ApplicationLine = require('./applicationLine.model')
const LoggingService = require('../services/logging.service')

class StandardRule extends BaseModel {
  static get entity () {
    return 'defra_standardrules'
  }

  static get mapping () {
    return [
      {field: 'id', dynamics: 'defra_standardruleid'},
      {field: 'permitName', dynamics: 'defra_rulesnamegovuk'},
      {field: 'limits', dynamics: 'defra_limits'},
      {field: 'code', dynamics: 'defra_code'},
      {field: 'guidanceUrl', dynamics: 'defra_guidanceurl'}
    ]
  }

  constructor (...args) {
    super(...args)
    const [standardRule] = args
    this.codeForId = StandardRule.transformPermitCode(standardRule.code)
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
      const result = response.value.pop()
      return StandardRule.dynamicsToModel(result)
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
      return StandardRule.dynamicsToModel(result)
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
