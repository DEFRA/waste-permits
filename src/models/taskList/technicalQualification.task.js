'use strict'

const Constants = require('../../constants')
const { TECHNICAL_QUALIFICATION } = require('./taskList').CompletedParameters
const BaseTask = require('./base.task')
const Annotation = require('../../persistence/entities/annotation.entity')

module.exports = class TechnicalQualification extends BaseTask {
  static get completenessParameter () {
    return TECHNICAL_QUALIFICATION
  }

  static async checkComplete (context, applicationId) {
    const evidence = await Annotation.listByApplicationIdAndSubject(context, applicationId, Constants.UploadSubject.TECHNICAL_QUALIFICATION)
    return Boolean(evidence.length)
  }
}
