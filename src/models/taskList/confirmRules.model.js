'use strict'

const {CONFIRM_RULES} = require('../../constants').Dynamics.CompletedParamters
const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const LoggingService = require('../../services/logging.service')
const ApplicationLine = require('../applicationLine.model')

module.exports = class ConfirmRules extends BaseModel {
  constructor (data) {
    super()
    this.applicationLineId = data.applicationLineId
  }

  static async updateCompleteness (context, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(context.authToken)

    try {
      const applicationLine = await ApplicationLine.getById(context, applicationLineId)

      const query = `defra_wasteparamses(${applicationLine.parametersId})`
      await dynamicsDal.update(query, {[CONFIRM_RULES]: true})
    } catch (error) {
      LoggingService.logError(`Unable to update ConfirmRules completeness: ${error}`)
      throw error
    }
  }

  static async isComplete (context, applicationId, applicationLineId) {
    let isComplete = false
    try {
      // Get the completed flag for confirm rules
      const completed = await ApplicationLine.getCompleted(context, applicationLineId, CONFIRM_RULES)

      isComplete = Boolean(completed)
    } catch (error) {
      LoggingService.logError(`Unable to retrieve ConfirmRules completeness: ${error}`)
      throw error
    }
    return isComplete
  }
}
