'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

module.exports = class StandardRule extends BaseModel {
  constructor (dataObject = undefined) {
    super()
    if (dataObject) {
      this.name = dataObject.name
      this.limits = dataObject.limits
      this.code = dataObject.code
      this.codeForId = StandardRule.transformPermitCode(dataObject.code)
    }
  }

  static async getByCode (authToken, code) {
    const dynamicsDal = new DynamicsDalService(authToken)

    const standardRule = new StandardRule()

    const filter = `defra_code eq '${code}'`
    const query = encodeURI(`defra_standardrules?$select=defra_rulesnamegovuk,defra_limits,defra_code&$filter=${filter}`)
    try {
      const response = await dynamicsDal.search(query)
      const result = response.value[0]

      // Set StandardRule properties
      standardRule.id = result.defra_standardruleid
      standardRule.name = result.defra_rulesnamegovuk
      standardRule.limits = result.defra_limits
      standardRule.code = result.defra_code
      standardRule.codeForId = StandardRule.transformPermitCode(standardRule.code)
    } catch (error) {
      LoggingService.logError(`Unable to get StandardRule by code: ${error}`)
      throw error
    }

    return standardRule
  }

  static async list (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    const filter =
      // Must be open for applications
      `defra_canapplyfor eq true` +
      // Must be SR2015 No 18 - *** this is temporary ***
      ` and defra_code eq 'SR2015 No 18'` +
      // Status code must be 1
      ` and statuscode eq 1`

    const query = encodeURI(`defra_standardrules?$select=defra_rulesnamegovuk,defra_limits,defra_code&$filter=${filter}`)
    try {
      const response = await dynamicsDal.search(query)

      const standardRules = {
        count: 0,
        results: []
      }

      // Parse response into Contact objects
      response.value.forEach((standardRule) => {
        standardRules.results.push(new StandardRule({
          // Construct the permit
          id: standardRule.defra_standardruleid,
          name: standardRule.defra_rulesnamegovuk,
          limits: standardRule.defra_limits,
          code: standardRule.defra_code
        }))
        standardRules.count++
      })
      return standardRules
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
