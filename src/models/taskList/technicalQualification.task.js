'use strict'

const Constants = require('../../constants')
const BaseTask = require('./base.task')
const Annotation = require('../../persistence/entities/annotation.entity')

module.exports = class TechnicalQualification extends BaseTask {
  static async checkComplete (context, applicationId) {
    const evidence = await Annotation.listByApplicationIdAndSubject(context, applicationId, Constants.UploadSubject.TECHNICAL_QUALIFICATION)
    return Boolean(evidence.length)
  }
}
