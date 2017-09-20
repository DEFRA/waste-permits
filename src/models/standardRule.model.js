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

  static async list (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)
    // Define the query
    // For now, we are just getting SR2015 No 18
    const today = new Date().toISOString()
    console.log(today)
    const query = `defra_standardrules?$select=defra_rulesnamegovuk,defra_limits,defra_code` +
                  // Only get standard rules which are valid for the current date
                  `&$filter=defra_validfrom%20le%20` +
                  today +
                  `%20and%20defra_validto%20ge%20` +
                  today +
                  // Must be open for applications
                  `%20and%20defra_canapplyfor%20eq%20true` +
                  // Must be open for online applications
                  `%20and%20defra_canapplyonline%20eq%20true` +
                  // Must be SR2015 No 18 - this is temporary
                  `%20and%20defra_code%20eq%20%27SR2015%20No%2018%27` +
                  // Status code must be 1
                  `%20and%20statuscode%20eq%201`

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
