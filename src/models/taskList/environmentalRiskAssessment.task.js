'use strict'

const Constants = require('../../constants')
const BaseTask = require('./base.task')
const Annotation = require('../../persistence/entities/annotation.entity')

module.exports = class EnvironmentalRiskAssessment extends BaseTask {
  static async checkComplete (context) {
    const evidence = await Annotation.listByApplicationIdAndSubject(context, Constants.UploadSubject.ENVIRONMENTAL_RISK_ASSESSMENT)
    return Boolean(evidence.length)
  }
}
