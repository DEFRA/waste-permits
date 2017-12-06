'use strict'

const Constants = require('../../constants')
const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const LoggingService = require('../../services/logging.service')
const Application = require('../application.model')
const ApplicationLine = require('../applicationLine.model')

module.exports = class TechnicalQualification extends BaseModel {
  constructor (data) {
    super()
    this.applicationLineId = data.applicationLineId
  }

  static async updateCompleteness (authToken, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)

    try {
      const applicationLine = await ApplicationLine.getById(authToken, applicationLineId)
      const isComplete = await TechnicalQualification._isComplete(authToken, applicationId)

      const entity = {
        [Constants.Dynamics.CompletedParamters.TECHNICAL_QUALIFICATION]: isComplete
      }
      const query = `defra_wasteparamses(${applicationLine.parametersId})`
      await dynamicsDal.update(query, entity)
    } catch (error) {
      LoggingService.logError(`Unable to update TechnicalQualification completeness: ${error}`)
      throw error
    }
  }

  static async _isComplete (authToken, applicationId) {
    let isComplete = false
    try {
      // Get the Application for this application
      const application = await Application.getById(authToken, applicationId)

      isComplete = application.technicalQualification !== undefined
    } catch (error) {
      LoggingService.logError(`Unable to calculate TechnicalQualification completeness: ${error}`)
      throw error
    }
    return isComplete
  }
}
