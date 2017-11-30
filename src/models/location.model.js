'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
const Utilities = require('../utilities/utilities')

module.exports = class Location extends BaseModel {
  constructor (location) {
    super()
    this.entity = 'defra_locations'
    this.id = location.id
    this.name = location.name
    this.applicationId = location.applicationId
    this.applicationLineId = location.applicationLineId
    Utilities.convertFromDynamics(this)
  }

  static async getByApplicationId (authToken, applicationId, applicationLineId) {
    let location
    if (applicationId !== undefined) {
      const dynamicsDal = new DynamicsDalService(authToken)
      const filter = `_defra_applicationid_value eq ${applicationId}`
      const query = encodeURI(`defra_locations?$select=defra_name&$filter=${filter}`)
      try {
        const response = await dynamicsDal.search(query)
        const result = response.value[0]
        if (result) {
          location = new Location({
            id: result.defra_locationid,
            applicationId: applicationId,
            applicationLineId: applicationLineId,
            name: result.defra_name
          })
        }
      } catch (error) {
        LoggingService.logError(`Unable to get Location by application ID: ${error}`)
        throw error
      }
    }
    return location
  }

  async save (authToken) {
    // Map the Location to the corresponding Dynamics schema Location object
    const dataObject = {
      defra_name: this.name,
      'defra_applicationId@odata.bind': `defra_applications(${this.applicationId})`
    }
    await super.save(authToken, dataObject)
  }
}
