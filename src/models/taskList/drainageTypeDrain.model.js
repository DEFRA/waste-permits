'use strict'

const {SURFACE_DRAINAGE} = require('../../constants').Dynamics.CompletedParamters
const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const LoggingService = require('../../services/logging.service')
const ApplicationLine = require('../applicationLine.model')

const updateCompleteness = async (authToken, applicationId, applicationLineId, value) => {
  const dynamicsDal = new DynamicsDalService(authToken)

  try {
    const applicationLine = await ApplicationLine.getById(authToken, applicationLineId)

    const query = `defra_wasteparamses(${applicationLine.parametersId})`
    await dynamicsDal.update(query, {[SURFACE_DRAINAGE]: value})
  } catch (error) {
    LoggingService.logError(`Unable set DrainageTypeDrain completeness to ${value}: ${error}`)
    throw error
  }
}

module.exports = class DrainageTypeDrain extends BaseModel {
  constructor (data) {
    super()
    this.applicationLineId = data.applicationLineId
  }

  static async updateCompleteness (...args) {
    await updateCompleteness(...args, true)
  }

  static async clearCompleteness (...args) {
    await updateCompleteness(...args, false)
  }

  static async isComplete (authToken, applicationId, applicationLineId) {
    let isComplete = false
    try {
      // Get the completed flag for surface drainage
      const completed = await ApplicationLine.getCompleted(authToken, applicationLineId, SURFACE_DRAINAGE)

      isComplete = Boolean(completed)
    } catch (error) {
      LoggingService.logError(`Unable to retrieve DrainageTypeDrain completeness: ${error.message}`)
      throw error
    }
    return isComplete
  }
}
