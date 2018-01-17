'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

module.exports = class Location extends BaseModel {
  static mapping () {
    return [
      {field: 'id', dynamics: 'defra_locationid'},
      {field: 'applicationId', dynamics: '_defra_applicationid_value', bind: {id: 'defra_applicationId', entity: 'defra_applications'}},
      {field: 'name', dynamics: 'defra_name'}
    ]
  }

  constructor (...args) {
    super(...args)
    const [location] = args
    if (location) {
      this.applicationLineId = location.applicationLineId
    }
    this.entity = 'defra_locations'
  }

  static async getByApplicationId (authToken, applicationId, applicationLineId) {
    if (applicationId) {
      const dynamicsDal = new DynamicsDalService(authToken)
      const filter = `_defra_applicationid_value eq ${applicationId}`
      const query = encodeURI(`defra_locations?$select=${Location.selectedDynamicsFields()}&$filter=${filter}`)
      try {
        const response = await dynamicsDal.search(query)
        const result = response.value[0]
        if (result) {
          const location = Location.dynamicsToModel(result)
          location.applicationLineId = applicationLineId
          return location
        }
      } catch (error) {
        LoggingService.logError(`Unable to get Location by application ID: ${error}`)
        throw error
      }
    }
  }

  async save (authToken) {
    const dataObject = this.modelToDynamics(({field}) => field !== 'id')
    await super.save(authToken, dataObject)
  }
}
