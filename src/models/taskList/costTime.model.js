'use strict'

const {SHOW_COST_AND_TIME} = require('../../constants').Dynamics.CompletedParamters
const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const LoggingService = require('../../services/logging.service')
const ApplicationLine = require('../applicationLine.model')

module.exports = class CostTime extends BaseModel {
  constructor (data) {
    super()
    this.applicationLineId = data.applicationLineId
  }

  static async updateCompleteness (authToken, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)

    try {
      const applicationLine = await ApplicationLine.getById(authToken, applicationLineId)

      const query = `defra_wasteparamses(${applicationLine.parametersId})`
      await dynamicsDal.update(query, {[SHOW_COST_AND_TIME]: true})
    } catch (error) {
      LoggingService.logError(`Unable to update CostTime completeness: ${error}`)
      throw error
    }
  }

  static async isComplete (authToken, applicationId, applicationLineId) {
    let isComplete = false
    try {
      // Get the completed flag for cost time
      const completed = await ApplicationLine.getCompleted(authToken, applicationLineId, SHOW_COST_AND_TIME)

      isComplete = Boolean(completed)
    } catch (error) {
      LoggingService.logError(`Unable to retrieve CostTime completeness: ${error}`)
      throw error
    }
    return isComplete
  }
}
