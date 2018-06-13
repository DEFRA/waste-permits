'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

class Location extends BaseModel {
  static get entity () {
    return 'defra_locations'
  }

  static get mapping () {
    return [
      {field: 'id', dynamics: 'defra_locationid'},
      {field: 'applicationId', dynamics: '_defra_applicationid_value', bind: {id: 'defra_applicationId', entity: 'defra_applications'}},
      {field: 'siteName', dynamics: 'defra_name', length: {max: 170}}
    ]
  }

  constructor (...args) {
    super(...args)
    const [location] = args
    if (location) {
      this.applicationLineId = location.applicationLineId
    }
  }

  static async getByApplicationId (context, applicationId, applicationLineId) {
    const location = await super.getBy(context, {applicationId})
    location.applicationLineId = applicationLineId
    return location
  }

  async save (context) {
    const dataObject = this.modelToDynamics(({field}) => field !== 'id')
    await super.save(context, dataObject)
  }
}

Location.setDefinitions()

module.exports = Location
