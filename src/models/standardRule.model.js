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
      this.codeForId = this.transformPermitCode(dataObject.code)
    }
  }

  static async getByCode (authToken, code) {
    const dynamicsDal = new DynamicsDalService(authToken)
    // Define the query
    const today = new Date().toISOString()
    const query = encodeURI(`defra_standardrules?$select=defra_rulesnamegovuk,defra_limits,defra_code` +
                  // Only get standard rules which are valid for the current date
                  `&$filter=defra_validfrom le ${today} ` +
                  ` and defra_validto ge ${today}` +
                  // Must be open for applications
                  ` and defra_canapplyfor eq true` +
                  // Must be open for online applications
                  ` and defra_canapplyonline eq true` +
                  // Must be SR2015 No 18 - this is temporary
                  ` and defra_code eq '${code}'` +
                  // Status code must be 1
                  ` and statuscode eq 1`)
    try {
      const response = await dynamicsDal.search(query)
      const result = response.value[0]

      // Construct and return the permit
      return new StandardRule({
        name: result.defra_rulesnamegovuk,
        limits: result.defra_limits,
        code: result.defra_code
      })
    } catch (error) {
      LoggingService.logError(`Unable to get StandardRule by code: ${error}`)
      throw error
    }
  }

  static async list (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)
    // Define the query
    // For now, we are just getting SR2015 No 18
    const today = new Date().toISOString()
    const query = encodeURI(`defra_standardrules?$select=defra_rulesnamegovuk,defra_limits,defra_code` +
                  // Only get standard rules which are valid for the current date
                  `&$filter=defra_validfrom le ${today} ` +
                  ` and defra_validto ge ${today}` +
                  // Must be open for applications
                  ` and defra_canapplyfor eq true` +
                  // Must be open for online applications
                  ` and defra_canapplyonline eq true` +
                  // Must be SR2015 No 18 - this is temporary
                  ` and defra_code eq 'SR2015 No 18'` +
                  // Status code must be 1
                  ` and statuscode eq 1`)

    const standardRules = {
      count: 0,
      results: []
    }

    try {
      const response = await dynamicsDal.search(query)

      // Parse response into Contact objects
      response.value.forEach((standardRule) => {
        standardRules.results.push(new StandardRule({
          // Construct the permit
          name: standardRule.defra_rulesnamegovuk,
          limits: standardRule.defra_limits,
          code: standardRule.defra_code
        }))
        standardRules.count++
      })
    } catch (error) {
      LoggingService.logError(`Unable to list StandardRules: ${error}`)
      throw error
    }
    return standardRules
  }

  // Transform the code into kebab-case for ID
  transformPermitCode (code) {
    return code.replace(/\s+/g, '-').toLowerCase()
  }
}
