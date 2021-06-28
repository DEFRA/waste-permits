'use strict'

const dynamicsDal = require('../../services/dynamicsDal.service')
const BaseEntity = require('./base.entity')
const LoggingService = require('../../services/logging.service')

class DynamicsSolution extends BaseEntity {
  static get dynamicsEntity () {
    return 'solutions'
  }

  static async get () {
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
      const response = await dynamicsDal.search(query)

      const dynamicsVersionInfo = []
      for (const solution of response.value) {
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
