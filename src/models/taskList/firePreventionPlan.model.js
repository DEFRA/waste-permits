'use strict'

const Constants = require('../../constants')
const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const LoggingService = require('../../services/logging.service')
const Annotation = require('../annotation.model')
const ApplicationLine = require('../applicationLine.model')

module.exports = class FirePreventionPlan extends BaseModel {
  static async updateCompleteness (authToken, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)

    try {
      const applicationLine = await ApplicationLine.getById(authToken, applicationLineId)
      const isComplete = await FirePreventionPlan.isComplete(authToken, applicationId, applicationLineId)

      const entity = {
        [Constants.Dynamics.CompletedParamters.FIRE_PREVENTION_PLAN]: isComplete
      }
      const query = `defra_wasteparamses(${applicationLine.parametersId})`
      await dynamicsDal.update(query, entity)
    } catch (error) {
      LoggingService.logError(`Unable to update ${this.name} completeness: ${error}`)
      throw error
    }
  }

  static async isComplete (authToken, applicationId, applicationLineId) {
    let isComplete = false
    try {
      // Get the Evidence for a fire prevention plan
      const evidence = await Annotation.listByApplicationIdAndSubject(authToken, applicationId, Constants.UploadSubject.FIRE_PREVENTION_PLAN)
      isComplete = Boolean(evidence.length)
    } catch (error) {
      LoggingService.logError(`Unable to calculate ${this.name} completeness: ${error}`)
      throw error
    }
    return isComplete
  }
}
