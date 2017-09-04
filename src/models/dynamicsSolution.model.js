'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')

const DYNAMICS_COMPONENT_NAMES = [
  'Core',
  'Licensing and Permitting',
  'Waste Permits'
]

module.exports = class DynamicsSolution extends BaseModel {
  static async get (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const query = encodeURI('solutions?$select=friendlyname,installedon,uniquename,version&$filter=isvisible eq true')
    try {
      const response = await dynamicsDal.search(query)

      // The three solutions we are interested in are:
      // - Core
      // - Licensing and Permitting
      // - Waste Permits
      const dynamicsVersionInfo = []
      for (let solution of response) {
        if (DYNAMICS_COMPONENT_NAMES.includes(solution.friendlyname)) {
          dynamicsVersionInfo.push({
            componentName: solution.friendlyname,
            version: solution.version
          })
        }
      }
      return dynamicsVersionInfo
    } catch (error) {
      console.error(`Unable to get Dynamics solution details: ${error}`)
      throw error
    }
  }
}
