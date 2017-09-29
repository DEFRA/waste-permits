'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

module.exports = class DynamicsSolution extends BaseModel {
  static async get (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    // The three solutions we are interested in are:
    // - Core
    // - Licensing and Permitting
    // - Waste Permits
    const filter = `isvisible eq true and
      friendlyname eq 'Core' or
      friendlyname eq 'Licensing and Permitting' or
      friendlyname eq 'Waste Permits'`

    const query = encodeURI(`solutions?$select=friendlyname,version&$filter=${filter}`)
    try {
      console.log('Call Dynamics looking for solution details')
      const response = await dynamicsDal.search(query)

      const dynamicsVersionInfo = []
      for (let solution of response.value) {
        dynamicsVersionInfo.push({
          componentName: solution.friendlyname,
          version: solution.version
        })
      }
      return dynamicsVersionInfo
    } catch (error) {
      console.log('BOOM - solution details search failed')
      LoggingService.logError(`Unable to get Dynamics solution details: ${error}`)
      throw error
    }
  }
}
