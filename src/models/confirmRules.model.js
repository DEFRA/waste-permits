'use strict'

const {CONFIRM_RULES} = require('../constants').Dynamics.CompletedParamters
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
const ApplicationLine = require('./applicationLine.model')

module.exports = class ConfirmRules extends BaseModel {
  static mapping () {
    return [
      {field: 'applicationId', dynamics: 'accountid'},
      {field: 'applicationLineId', dynamics: 'defra_companyhouseid'},
      {field: 'complete'}
    ]
  }

  static async getByApplicationId (authToken, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const query = encodeURI(`defra_applicationlines(${applicationLineId})?$expand=defra_parametersId($select=${CONFIRM_RULES})`)
    try {
      const result = await dynamicsDal.search(query)

      let confirmRules
      if (result) {
        confirmRules = new ConfirmRules({
          applicationId: applicationId,
          applicationLineId: applicationLineId,
          complete: result.defra_parametersId[CONFIRM_RULES]
        })
      }
      return confirmRules
    } catch (error) {
      LoggingService.logError(`Unable to get confirmRules by application ID: ${error}`)
      throw error
    }
  }

  async save (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    // Update the completeness flag
    try {
      const applicationLine = await ApplicationLine.getById(authToken, this.applicationLineId)
      if (applicationLine) {
        const entity = {}
        entity[CONFIRM_RULES] = true

        const query = `defra_wasteparamses(${applicationLine.parametersId})`
        await dynamicsDal.update(query, entity)
      }
    } catch (error) {
      LoggingService.logError(`Unable to update Confirm Rules completeness: ${error}`)
      throw error
    }
  }
}
