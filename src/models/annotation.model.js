'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

class Annotation extends BaseModel {
  static get entity () {
    return 'annotations'
  }

  static get mapping () {
    return [
      {field: 'applicationId', dynamics: '_objectid_value', bind: {id: 'objectid_defra_application', entity: 'defra_applications'}},
      {field: 'id', dynamics: 'annotationid'},
      {field: 'subject', dynamics: 'subject'},
      {field: 'filename', dynamics: 'filename', length: {max: 255}},
      {field: 'documentBody', dynamics: 'documentbody'}
    ]
  }

  static async getById (authToken, id) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const query = `annotations(${id})?$select=${Annotation.selectedDynamicsFields()}`
    try {
      const result = await dynamicsDal.search(query)
      return Annotation.dynamicsToModel(result)
    } catch (error) {
      LoggingService.logError(`Unable to get Annotation by ID: ${error}`)
      throw error
    }
  }

  static async listByApplicationIdAndSubject (authToken, applicationId, subject) {
    if (applicationId) {
      const dynamicsDal = new DynamicsDalService(authToken)
      const filter = `_objectid_value eq ${applicationId} and  objecttypecode eq 'defra_application' and subject eq '${subject}'`
      const query = encodeURI(`annotations?$select=${Annotation.selectedDynamicsFields()}&$filter=${filter}`)
      try {
        const response = await dynamicsDal.search(query)
        return response.value.map((result) => Annotation.dynamicsToModel(result))
      } catch (error) {
        LoggingService.logError(`Unable to get Annotations by application ID: ${error}`)
        throw error
      }
    }
  }

  async save (authToken) {
    const dataObject = this.modelToDynamics()
    await super.save(authToken, dataObject)
  }
}

Annotation.setDefinitions()

module.exports = Annotation
