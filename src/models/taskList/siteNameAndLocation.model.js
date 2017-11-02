'use strict'

const Constants = require('../../constants')

const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const ApplicationLine = require('../applicationLine.model')
const Location = require('../location.model')
const LocationDetail = require('../locationDetail.model')
const LoggingService = require('../../services/logging.service')

module.exports = class SiteNameAndLocation extends BaseModel {
  static async updateCompleteness (authToken, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)

    try {
      const applicationLine = await ApplicationLine.getById(authToken, applicationLineId)
      const isComplete = await SiteNameAndLocation._isComplete(authToken, applicationId, applicationLineId)

      const entity = {
        [Constants.Dynamics.CompletedParamters.SITE_NAME_LOCATION]: isComplete
      }
      const query = `defra_wasteparamses(${applicationLine.parametersId})`
      await dynamicsDal.update(query, entity)
    } catch (error) {
      LoggingService.logError(`Unable to update SiteNameAndLocation completeness: ${error}`)
      throw error
    }
  }

  static async _isComplete (authToken, applicationId, applicationLineId) {
    let isComplete = false
    try {
      // Get the Location for this application
      const location = await Location.getByApplicationId(authToken, applicationId, applicationLineId)

      // Get the LocationDetail
      const locationDetail = await LocationDetail.getByLocationId(authToken, location.id)

      if (location && locationDetail) {
        isComplete =
          location.name !== undefined && location.name.length > 0 &&
          locationDetail.gridReference !== undefined && locationDetail.gridReference.length > 0
      }
    } catch (error) {
      LoggingService.logError(`Unable to calculate SiteNameAndLocation completeness: ${error}`)
      throw error
    }
    return isComplete
  }
}
