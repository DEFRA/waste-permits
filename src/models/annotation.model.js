'use strict'

const BaseModel = require('./base.model')

class Annotation extends BaseModel {
  static get entity () {
    return 'annotations'
  }

  static get mapping () {
    return [
      { field: 'applicationId', dynamics: '_objectid_value', bind: { id: 'objectid_defra_application', entity: 'defra_applications' } },
      { field: 'id', dynamics: 'annotationid' },
      { field: 'subject', dynamics: 'subject', encode: true },
      { field: 'filename', dynamics: 'filename', encode: true, length: { max: 255 } },
      { field: 'documentBody', dynamics: 'documentbody', writeOnly: true }
    ]
  }

  static async getByApplicationIdSubjectAndFilename (context, applicationId, subject, filename) {
    return super.getBy(context, { applicationId, subject, filename })
  }

  static async listByApplicationIdAndSubject (context, applicationId, subject) {
    return super.listBy(context, { applicationId, subject })
  }
}

Annotation.setDefinitions()

module.exports = Annotation
