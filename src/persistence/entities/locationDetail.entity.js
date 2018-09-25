'use strict'

const BaseModel = require('./base.entity')

class LocationDetail extends BaseModel {
  static get dynamicsEntity () {
    return 'defra_locationdetailses'
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_locationdetailsid', readOnly: true },
      { field: 'locationId', dynamics: '_defra_locationid_value', bind: { id: 'defra_locationId', dynamicsEntity: 'defra_locations' } },
      { field: 'addressId', dynamics: '_defra_addressid_value', bind: { id: 'defra_addressId', dynamicsEntity: 'defra_addresses' } },
      { field: 'siteName', dynamics: 'defra_name', length: { max: 170 } },
      { field: 'gridReference', dynamics: 'defra_gridreferenceid', length: { max: 14 } }
    ]
  }

  static async getByLocationId (context, locationId) {
    return super.getBy(context, { locationId })
  }

  setAddress (addressId) {
    this.addressId = addressId
  }
}

LocationDetail.setDefinitions()

module.exports = LocationDetail
