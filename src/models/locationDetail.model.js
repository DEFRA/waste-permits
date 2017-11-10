'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
const Utilities = require('../utilities/utilities')

module.exports = class LocationDetail extends BaseModel {
  constructor (locationDetail) {
    super()
    this.id = locationDetail.id
    this.gridReference = locationDetail.gridReference
    this.locationId = locationDetail.locationId
    this.addressId = locationDetail.addressId
  }

  static async getByLocationId (authToken, locationId) {
    let locationDetail
    if (locationId !== undefined) {
      const dynamicsDal = new DynamicsDalService(authToken)
      const filter = `_defra_locationid_value eq ${locationId}`
      const query = encodeURI(`defra_locationdetailses?$select=defra_gridreferenceid,_defra_addressid_value&$filter=${filter}`)
      try {
        const response = await dynamicsDal.search(query)
        const result = response.value[0]

        if (result) {
          locationDetail = new LocationDetail({
            id: Utilities.replaceNull(result.defra_locationdetailsid),
            locationId: locationId,
            gridReference: Utilities.replaceNull(result.defra_gridreferenceid),
            addressId: Utilities.replaceNull(result._defra_addressid_value)
          })
        }
      } catch (error) {
        LoggingService.logError(`Unable to get LocationDetail by Location ID: ${error}`)
        throw error
      }
    }
    return locationDetail
  }

  setAddress (addressId) {
    this.addressId = addressId
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
      if (this.addressId) {
        dataObject['defra_addressId@odata.bind'] = `defra_addresses(${this.addressId})`
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
