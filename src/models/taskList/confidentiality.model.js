'use strict'

const Constants = require('../../constants')
const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const LoggingService = require('../../services/logging.service')
const Application = require('../application.model')
const ApplicationLine = require('../applicationLine.model')

module.exports = class Confidentiality extends BaseModel {
  constructor (data) {
    super()
    this.applicationLineId = data.applicationLineId
  }

  static async updateCompleteness (authToken, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)

    try {
      const applicationLine = await ApplicationLine.getById(authToken, applicationLineId)
      const isComplete = await Confidentiality.isComplete(authToken, applicationId, applicationLineId)

      const entity = {
        [Constants.Dynamics.CompletedParamters.CONFIRM_CONFIDENTIALLY]: isComplete
      }
      const query = `defra_wasteparamses(${applicationLine.parametersId})`
      await dynamicsDal.update(query, entity)
    } catch (error) {
      LoggingService.logError(`Unable to update Confidentiality completeness: ${error}`)
      throw error
    }
  }

  static async isComplete (authToken, applicationId, applicationLineId) {
    let isComplete = false
    try {
      // Get the Application for this application
      const application = await Application.getById(authToken, applicationId)

      isComplete = application.confidentiality !== undefined
    } catch (error) {
      LoggingService.logError(`Unable to calculate Confidentiality completeness: ${error}`)
      throw error
    }
    return isComplete
  }
}
