'use strict'

const Constants = require('../../constants')
const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const LoggingService = require('../../services/logging.service')
const Contact = require('../contact.model')
const ApplicationLine = require('../applicationLine.model')

module.exports = class ContactDetails extends BaseModel {
  constructor (data) {
    super()
    this.applicationLineId = data.applicationLineId
  }

  static async updateCompleteness (context, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(context.authToken)

    try {
      const applicationLine = await ApplicationLine.getById(context, applicationLineId)
      const isComplete = await ContactDetails.isComplete(context, applicationId, applicationLineId)

      const entity = {
        [Constants.Dynamics.CompletedParamters.CONTACT_DETAILS]: isComplete
      }
      const query = `defra_wasteparamses(${applicationLine.parametersId})`
      await dynamicsDal.update(query, entity)
    } catch (error) {
      LoggingService.logError(`Unable to update ContactDetails completeness: ${error}`)
      throw error
    }
  }

  static async isComplete (context, applicationId, applicationLineId) {
    let isComplete = false
    try {
      // Get the Contact for this application
      const contact = await Contact.getByApplicationId(context, applicationId)

      isComplete = Boolean(contact && contact.firstName)
    } catch (error) {
      LoggingService.logError(`Unable to calculate ContactDetails completeness: ${error}`)
      throw error
    }
    return isComplete
  }
}
