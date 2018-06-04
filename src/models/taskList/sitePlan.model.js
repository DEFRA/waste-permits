'use strict'

const Constants = require('../../constants')
const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const LoggingService = require('../../services/logging.service')
const Annotation = require('../annotation.model')
const ApplicationLine = require('../applicationLine.model')

module.exports = class SitePlan extends BaseModel {
  static async updateCompleteness (context, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(context.authToken)

    try {
      const applicationLine = await ApplicationLine.getById(context, applicationLineId)
      const isComplete = await SitePlan.isComplete(context, applicationId, applicationLineId)

      const entity = {
        [Constants.Dynamics.CompletedParamters.SITE_PLAN]: isComplete
      }
      const query = `defra_wasteparamses(${applicationLine.parametersId})`
      await dynamicsDal.update(query, entity)
    } catch (error) {
      LoggingService.logError(`Unable to update SitePlan completeness: ${error}`)
      throw error
    }
  }

  static async isComplete (context, applicationId, applicationLineId) {
    let isComplete = false
    try {
      // Get the Evidence for a site plan
      const evidence = await Annotation.listByApplicationIdAndSubject(context, applicationId, Constants.UploadSubject.SITE_PLAN)
      isComplete = Boolean(evidence.length)
    } catch (error) {
      LoggingService.logError(`Unable to calculate SitePlan completeness: ${error}`)
      throw error
    }
    return isComplete
  }
}
