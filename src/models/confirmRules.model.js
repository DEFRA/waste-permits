'use strict'

const Constants = require('../constants')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
const ApplicationLine = require('./applicationLine.model')

module.exports = class Site extends BaseModel {
  constructor (data) {
    super()
    this.applicationLineId = data.applicationLineId
  }

  async save (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    // Update the completeness flag
    try {
      const applicationLine = await ApplicationLine.getById(authToken, this.applicationLineId)
      if (applicationLine) {
        const entity = {}
        entity[Constants.Dynamics.CompletedParamters.CONFIRM_RULES] = true

        const query = `defra_wasteparamses(${applicationLine.parametersId})`
        await dynamicsDal.update(query, entity)
      }
    } catch (error) {
      LoggingService.logError(`Unable to update Site completeness: ${error}`)
      throw error
    }
  }
}
