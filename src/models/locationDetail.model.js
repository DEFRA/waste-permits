'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

class LocationDetail extends BaseModel {
  static get entity () {
    return 'defra_locationdetailses'
  }

  static get mapping () {
    return [
      {field: 'id', dynamics: 'defra_locationdetailsid'},
      {field: 'locationId', dynamics: '_defra_locationid_value', bind: {id: 'defra_locationId', entity: 'defra_locations'}},
      {field: 'addressId', dynamics: '_defra_addressid_value', bind: {id: 'defra_addressId', entity: 'defra_addresses'}},
      {field: 'siteName', dynamics: 'defra_name', length: {max: 170}},
      {field: 'gridReference', dynamics: 'defra_gridreferenceid', length: {max: 14}}
    ]
  }

  static async getByLocationId (authToken, locationId) {
    if (locationId) {
      const dynamicsDal = new DynamicsDalService(authToken)
      const filter = `_defra_locationid_value eq ${locationId}`
      const query = encodeURI(`defra_locationdetailses?$select=${LocationDetail.selectedDynamicsFields()}&$filter=${filter}`)
      try {
        const response = await dynamicsDal.search(query)
        const result = response.value.pop()

        if (result) {
          return LocationDetail.dynamicsToModel(result)
        }
      } catch (error) {
        LoggingService.logError(`Unable to get LocationDetail by Location ID: ${error}`)
        throw error
      }
    }
  }

  setAddress (addressId) {
    this.addressId = addressId
  }

  async save (authToken) {
    const dataObject = this.modelToDynamics(({field}) => field !== 'id')
    await super.save(authToken, dataObject)
  }
}

LocationDetail.setDefinitions()

module.exports = LocationDetail
