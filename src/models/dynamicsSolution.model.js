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

    // TODO Get the filter to work?
    const query = 'solutions?$select=friendlyname,installedon,uniquename,version'
    // const query = encodeURIComponent('solutions?$select=friendlyname,installedon,uniquename,version&$filter=isvisible eq true')
    // const query = encodeURIComponent('solutions?$select=friendlyname,installedon,uniquename,version')
    // const query = 'solutions?$select=friendlyname,installedon,uniquename,version&$filter=isvisible eq true'
    // const query = 'contacts?$select=contactid,firstname,lastname'

    const dynamicsVersionInfo = []
    try {
      const response = await dynamicsDal.search(query)

      // The three solutions we are interested in are:
      // - Core
      // - LicensingandPermitting
      // - WastePermits
      for (var solution of response) {
        if (DYNAMICS_COMPONENT_NAMES.includes(solution.friendlyname)) {
          dynamicsVersionInfo.push({
            componentName: solution.friendlyname,
            version: solution.version
          })
        }
      }
      console.log(dynamicsVersionInfo)
    } catch (error) {
      console.error(`Unable to get Dynamics solution details: ${error}`)
      throw error
    }
    return dynamicsVersionInfo
  }
}
