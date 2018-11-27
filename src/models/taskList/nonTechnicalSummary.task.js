'use strict'

const Constants = require('../../constants')
const BaseTask = require('./base.task')
const Annotation = require('../../persistence/entities/annotation.entity')

module.exports = class NonTechnicalSummary extends BaseTask {
  static async checkComplete (context) {
    const { applicationId } = context
    const evidence = await Annotation.listByApplicationIdAndSubject(context, applicationId, Constants.UploadSubject.NON_TECHNICAL_SUMMARY)
    return Boolean(evidence.length)
  }
}
