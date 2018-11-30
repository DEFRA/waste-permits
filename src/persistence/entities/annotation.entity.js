'use strict'

const BaseEntity = require('./base.entity')

class Annotation extends BaseEntity {
  static get dynamicsEntity () {
    return 'annotations'
  }

  static get mapping () {
    return [
      { field: 'applicationId', dynamics: '_objectid_value', bind: { id: 'objectid_defra_application', dynamicsEntity: 'defra_applications' } },
      { field: 'id', dynamics: 'annotationid' },
      { field: 'subject', dynamics: 'subject', encode: true },
      { field: 'filename', dynamics: 'filename', encode: true, length: { max: 255 } },
      { field: 'documentBody', dynamics: 'documentbody', writeOnly: true }
    ]
  }

  static async getByApplicationIdSubjectAndFilename (context, subject, filename) {
    const { applicationId } = context
    return super.getBy(context, { applicationId, subject, filename })
  }

  static async listByApplicationIdAndSubject (context, subject) {
    const { applicationId } = context
    return super.listBy(context, { applicationId, subject })
  }
}

Annotation.setDefinitions()

module.exports = Annotation
