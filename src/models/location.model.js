'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

module.exports = class Location extends BaseModel {
  constructor (location) {
    super()
    this.id = location.id
    this.name = location.name
    this.applicationId = location.applicationId
    this.applicationLineId = location.applicationLineId
  }

  static async getByApplicationId (authToken, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const filter = `_defra_applicationid_value eq ${applicationId}`
    const query = encodeURI(`defra_locations?$select=defra_name&$filter=${filter}`)
    try {
      const response = await dynamicsDal.search(query)
      const result = response.value[0]

      let location
      if (result) {
        location = new Location({
          id: result.defra_locationid,
          applicationId: applicationId,
          applicationLineId: applicationLineId,
          name: result.defra_name
        })
      }
      return location
    } catch (error) {
      LoggingService.logError(`Unable to get Location by application ID: ${error}`)
      throw error
    }
  }

  async save (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    // Update the Location
    try {
      // Map the Location to the corresponding Dynamics schema Location object
      const dataObject = {
        defra_name: this.name,
        'defra_applicationId@odata.bind': `defra_applications(${this.applicationId})`
      }
      let query
      if (this.isNew()) {
        // New Location
        query = 'defra_locations'
        this.id = await dynamicsDal.create(query, dataObject)
      } else {
        // Update Location
        query = `defra_locations(${this.id})`
        await dynamicsDal.update(query, dataObject)
      }
    } catch (error) {
      LoggingService.logError(`Unable to save Location: ${error}`)
      throw error
    }
  }
}
