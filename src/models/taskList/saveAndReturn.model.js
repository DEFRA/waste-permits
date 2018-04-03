'use strict'

const {SAVE_AND_RETURN_EMAIL} = require('../../constants').Dynamics.CompletedParamters
const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const LoggingService = require('../../services/logging.service')
const Application = require('../application.model')
const ApplicationLine = require('../applicationLine.model')

module.exports = class SaveAndReturn extends BaseModel {
  constructor (data) {
    super()
    this.applicationLineId = data.applicationLineId
  }

  static async updateCompleteness (authToken, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)

    try {
      const applicationLine = await ApplicationLine.getById(authToken, applicationLineId)

      const query = `defra_wasteparamses(${applicationLine.parametersId})`
      await dynamicsDal.update(query, {[SAVE_AND_RETURN_EMAIL]: true})
    } catch (error) {
      LoggingService.logError(`Unable to update SaveAndReturn completeness: ${error}`)
      throw error
    }
  }

  static async isComplete (authToken, applicationId, applicationLineId) {
    let isComplete = false
    try {
      // Get the Application for this application
      const application = await Application.getById(authToken, applicationId)

      // Get the completed flag for save and return
      const completed = await ApplicationLine.getCompleted(authToken, applicationLineId, SAVE_AND_RETURN_EMAIL)

      isComplete = Boolean(completed && application.saveAndReturnEmail)
    } catch (error) {
      LoggingService.logError(`Unable to retrieve SaveAndReturn completeness: ${error}`)
      throw error
    }
    return isComplete
  }
}
