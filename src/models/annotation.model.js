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

  static async getById (context, id) {
    return super.getById(context, id, ({dynamics}) => dynamics !== 'documentbody')
  }

  static async getByApplicationIdSubjectAndFilename (context, applicationId, subject, filename) {
    let payment
    if (applicationId) {
      const dynamicsDal = new DynamicsDalService(context.authToken)
      const filter = `_objectid_value eq ${applicationId} and filename eq '${filename}' and subject eq '${subject}'`
      const query = `annotations?$select=${Annotation.selectedDynamicsFields()}&$filter=${filter}`
      try {
        const response = await dynamicsDal.search(query)
        const result = response && response.value ? response.value.pop() : undefined
        if (result) {
          payment = Annotation.dynamicsToModel(result)
        }
      } catch (error) {
        LoggingService.logError(`Unable to get Annotation by Application ID(${applicationId}), Filename(${filename}) and Subject(${subject}): ${error}`)
        throw error
      }
    }
    return payment
  }

  static async listByApplicationIdAndSubject (context, applicationId, subject) {
    if (applicationId) {
      const dynamicsDal = new DynamicsDalService(context.authToken)
      const filter = `_objectid_value eq ${applicationId} and objecttypecode eq 'defra_application' and subject eq '${subject}'`
      const query = encodeURI(`annotations?$select=${Annotation.selectedDynamicsFields(({dynamics}) => dynamics !== 'documentbody')}&$filter=${filter}`)
      try {
        const response = await dynamicsDal.search(query)
        return response.value.map((result) => Annotation.dynamicsToModel(result))
      } catch (error) {
        LoggingService.logError(`Unable to get Annotations by application ID: ${error}`)
        throw error
      }
    }
  }

  async save (context) {
    const dataObject = this.modelToDynamics()
    await super.save(context, dataObject)
  }
}

Annotation.setDefinitions()

module.exports = Annotation
