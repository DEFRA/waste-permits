'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
const Utilities = require('../utilities/utilities')

module.exports = class Annotation extends BaseModel {
  constructor (annotation) {
    super()
    this.entity = 'annotations'
    this.id = annotation.id
    this.subject = annotation.subject
    this.filename = annotation.filename
    this.documentBody = annotation.documentBody
    this.applicationId = annotation.applicationId
    Utilities.convertFromDynamics(this)
  }

  static selectedDynamicsFields () {
    return [
      'annotationid',
      'subject',
      'filename',
      '_objectid_value'
    ]
  }

  static async getById (authToken, id) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const query = `annotations(${id})?$select=${Annotation.selectedDynamicsFields()}`

    try {
      const response = await dynamicsDal.search(query)

      return new Annotation({
        id: response.annotationid,
        applicationId: response['_objectid_value'],
        subject: response.subject,
        filename: response.filename
      })
    } catch (error) {
      LoggingService.logError(`Unable to get Annotation by ID: ${error}`)
      throw error
    }
  }

  static async listByApplicationId (authToken, applicationId) {
    if (applicationId !== undefined) {
      const dynamicsDal = new DynamicsDalService(authToken)
      const filter = `_objectid_value eq ${applicationId} and  objecttypecode eq 'defra_application'`
      const query = encodeURI(`annotations?$select=${Annotation.selectedDynamicsFields()}&$filter=${filter}`)
      try {
        const response = await dynamicsDal.search(query)
        return response.value.map((result) => new Annotation({
          id: result.annotationid,
          applicationId: result['_objectid_value'],
          subject: result.subject,
          filename: result.filename
        }))
      } catch (error) {
        LoggingService.logError(`Unable to get Annotations by application ID: ${error}`)
        throw error
      }
    }
  }

  async save (authToken) {
    // Map the Annotation to the corresponding Dynamics schema Annotation object
    const dataObject = {
      subject: this.subject,
      filename: this.filename,
      documentbody: this.documentBody,
      'objectid_defra_application@odata.bind': `defra_applications(${this.applicationId})`
    }
    await super.save(authToken, dataObject)
  }
}
