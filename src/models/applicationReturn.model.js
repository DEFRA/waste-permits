'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

class ApplicationReturn extends BaseModel {
  static get entity () {
    return 'defra_saveandreturns'
  }

  static get readOnly () {
    return true
  }

  static get mapping () {
    return [
      {field: 'applicationId', dynamics: '_defra_application_value'},
      {field: 'slug', dynamics: 'defra_suffix'}
    ]
  }

  static async getBySlug (authToken, slug) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const filter = `defra_suffix eq '${slug}'`
    const query = `defra_saveandreturns?$select=${ApplicationReturn.selectedDynamicsFields()}&$filter=${filter}`
    try {
      const response = await dynamicsDal.search(query)
      const result = response && response.value ? response.value.pop() : undefined
      if (result) {
        return ApplicationReturn.dynamicsToModel(result)
      }
    } catch (error) {
      LoggingService.logError(`Unable to get ApplicationReturn by Slug(${slug}): ${error}`)
      throw error
    }
  }
}

ApplicationReturn.setDefinitions()

module.exports = ApplicationReturn
