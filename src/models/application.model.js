'use strict'

const LoggingService = require('../services/logging.service')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')

module.exports = class Application extends BaseModel {
  async save (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    const dataObject = {}

    try {
      let query
      if (this.isNew()) {
        // New application
        query = 'defra_applications'
        this.id = await dynamicsDal.create(query, dataObject)
        LoggingService.logInfo(`Created application with ID: ${this.id}`)
      }
    } catch (error) {
      LoggingService.logError(`Unable to save Application: ${error}`)
      throw error
    }
  }
}
