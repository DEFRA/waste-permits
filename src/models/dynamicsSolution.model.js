'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

class DynamicsSolution extends BaseModel {
  static get entity () {
    return 'solutions'
  }

  static async get (context) {
    const dynamicsDal = new DynamicsDalService(context.authToken)

    // The three solutions we are interested in are:
    // - Core
    // - Licensing and Permitting
    // - Waste Permits
    const filter = `isvisible eq true and
      friendlyname eq 'Core' or
      friendlyname eq 'Licensing and Permitting' or
      friendlyname eq 'Waste Permits'`

    const query = encodeURI(`solutions?$select=friendlyname,version${filter ? `&$filter=${filter}` : ''}`)
    try {
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
      LoggingService.logError(`Unable to get Dynamics solution details: ${error}`)
      throw error
    }
  }
}

DynamicsSolution.setDefinitions()

module.exports = DynamicsSolution
