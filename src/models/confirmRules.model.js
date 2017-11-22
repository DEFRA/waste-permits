'use strict'

const Constants = require('../constants')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
const ApplicationLine = require('./applicationLine.model')
const Utilities = require('../utilities/utilities')

module.exports = class ConfirmRules extends BaseModel {
  constructor (confirmRules) {
    super()
    this.applicationId = confirmRules.applicationId
    this.applicationLineId = confirmRules.applicationLineId
    this.complete = confirmRules.complete
    // The following delay is required by the untilComplete method
    this.delay = 250
    Utilities.convertFromDynamics(this)
  }

  static async getByApplicationId (authToken, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const query = encodeURI(`defra_applicationlines(${applicationLineId})?$expand=defra_parametersId($select=${Constants.Dynamics.CompletedParamters.CONFIRM_RULES})`)
    try {
      const result = await dynamicsDal.search(query)

      let confirmRules
      if (result) {
        confirmRules = new ConfirmRules({
          applicationId: applicationId,
          applicationLineId: applicationLineId,
          complete: result.defra_parametersId[Constants.Dynamics.CompletedParamters.CONFIRM_RULES]
        })
      }
      return confirmRules
    } catch (error) {
      LoggingService.logError(`Unable to get confirmRules by application ID: ${error}`)
      throw error
    }
  }

  // A bug currently exists where the completeness isn't updated straight away in dynamics even when the save is successful.
  // This function is a temporary fix to wait until we are sure we can get the completeness value.
  // This and the code overriding the delay property in the test, can be removed when the update is successful only when the update in dynamics has fully completed.
  async untilComplete (authToken) {
    for (let retries = 10; retries && !(await ConfirmRules.getByApplicationId(authToken, this.applicationId, this.applicationLineId)).complete; retries--) {
      if (!retries) {
        throw new Error('Failed to complete')
      }
      await new Promise(resolve => setTimeout(resolve, this.delay))
    }
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
        // The following "untilComplete" can be removed when the update is successful only when the update in dynamics has fully completed.
        await this.untilComplete(authToken)
      }
    } catch (error) {
      LoggingService.logError(`Unable to update Confirm Rules completeness: ${error}`)
      throw error
    }
  }
}
