'use strict'

// TODO remove this?
// const Constants = require('../constants')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
// const ApplicationLine = require('./applicationLine.model')

module.exports = class LocationDetail extends BaseModel {
  constructor (locationDetail) {
    super()
    this.id = locationDetail.id
    this.gridReference = locationDetail.gridReference
    this.locationId = locationDetail.locationId
  }

  static async getByLocationId (authToken, locationId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const filter = `_defra_locationid_value eq ${locationId}`
    const query = encodeURI(`defra_locationdetailses?$select=defra_gridreferenceid&$filter=${filter}`)
    try {
      const response = await dynamicsDal.search(query)
      const result = response.value[0]

      let locationDetail
      if (result) {
        locationDetail = new LocationDetail({
          id: result.defra_locationdetailsid,
          locationId: locationId,
          gridReference: result.defra_gridreferenceid
        })
      }
      return locationDetail
    } catch (error) {
      LoggingService.logError(`Unable to get Site by application ID: ${error}`)
      throw error
    }
  }

  async save (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    // Update the LocationDetail
    try {
      // Map the Location to the corresponding Dynamics schema LocationDetail object
      const dataObject = {
        defra_gridreferenceid: this.gridReference,
        'defra_locationId@odata.bind': `defra_locations(${this.locationId})`
      }

      let query
      if (this.isNew()) {
        // New LocationDetail
        query = 'defra_locationdetailses'
        this.id = await dynamicsDal.create(query, dataObject)
      } else {
        // Update LocationDetail
        query = `defra_locationdetailses(${this.id})`
        await dynamicsDal.update(query, dataObject)
      }
    } catch (error) {
      LoggingService.logError(`Unable to save LocationDetail: ${error}`)
      throw error
    }
  }
}
