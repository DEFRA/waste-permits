'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')

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
      console.error(`Unable to get Dynamics solution details: ${error}`)
      throw error
    }
  }
}
