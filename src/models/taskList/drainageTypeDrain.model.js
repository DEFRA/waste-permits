'use strict'

const {SURFACE_DRAINAGE} = require('../../constants').Dynamics.CompletedParamters
const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const LoggingService = require('../../services/logging.service')
const ApplicationLine = require('../applicationLine.model')

module.exports = class DrainageTypeDrain extends BaseModel {
  constructor (data) {
    super()
    this.applicationLineId = data.applicationLineId
  }

  static async updateCompleteness (authToken, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)

    try {
      const applicationLine = await ApplicationLine.getById(authToken, applicationId, applicationLineId)

      const query = `defra_wasteparamses(${applicationLine.parametersId})`
      await dynamicsDal.update(query, {[SURFACE_DRAINAGE]: true})
    } catch (error) {
      LoggingService.logError(`Unable to update DrainageTypeDrain completeness: ${error}`)
      throw error
    }
  }

  static async isComplete (authToken, applicationId, applicationLineId) {
    let isComplete = false
    try {
      // Get the completed flag for surface drainage
      const completed = await ApplicationLine.getCompleted(authToken, applicationLineId, SURFACE_DRAINAGE)

      isComplete = Boolean(completed)
    } catch (error) {
      LoggingService.logError(`Unable to retrieve DrainageTypeDrain completeness: ${error}`)
      throw error
    }
    return isComplete
  }
}
