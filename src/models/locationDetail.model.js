'use strict'

const BaseModel = require('./base.model')

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

  static async getByLocationId (context, locationId) {
    return super.getBy(context, {locationId})
  }

  setAddress (addressId) {
    this.addressId = addressId
  }

  async save (context) {
    const dataObject = this.modelToDynamics(({field}) => field !== 'id')
    await super.save(context, dataObject)
  }
}

LocationDetail.setDefinitions()

module.exports = LocationDetail
