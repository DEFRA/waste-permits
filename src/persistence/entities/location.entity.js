'use strict'

const BaseEntity = require('./base.entity')

class Location extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_locations'
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_locationid', readOnly: true },
      { field: 'applicationId', dynamics: '_defra_applicationid_value', bind: { id: 'defra_applicationId', dynamicsEntity: 'defra_applications' } },
      { field: 'siteName', dynamics: 'defra_name', length: { max: 170 } }
    ]
  }

  constructor (...args) {
    super(...args)
    const [location] = args
    if (location) {
      this.applicationLineId = location.applicationLineId
    }
  }

  static async getByApplicationId (context) {
    const { applicationId, applicationLineId } = context
    const location = await super.getBy(context, { applicationId })
    if (location) {
      location.applicationLineId = applicationLineId
    }
    return location
  }
}

Location.setDefinitions()

module.exports = Location
