'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

class Configuration extends BaseModel {
  static get entity () {
    return 'defra_configurations'
  }

  static get readOnly () {
    return true
  }

  static get mapping () {
    return [
      {field: 'title', dynamics: 'defra_name'},
      {field: 'status', dynamics: 'statuscode'}
    ]
  }

  static async list (context) {
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const query = encodeURI(`defra_configurations?$select=${Configuration.selectedDynamicsFields()}`)
    try {
      const response = await dynamicsDal.search(query)
      return response.value.map((result) => Configuration.dynamicsToModel(result))
    } catch (error) {
      LoggingService.logError(`Unable to get Configurations: ${error}`)
      throw error
    }
  }
}

Configuration.setDefinitions()

module.exports = Configuration
