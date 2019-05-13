'use strict'

const Constants = require('../../constants')
const BaseTask = require('./base.task')
const Annotation = require('../../persistence/entities/annotation.entity')

module.exports = class BestAvailableTechniquesAssessment extends BaseTask {
  static async checkComplete (context) {
    const evidence = await Annotation.listByApplicationIdAndSubject(context, Constants.UploadSubject.BEST_AVAILABLE_TECHNIQUES_ASSESSMENT)
    return Boolean(evidence.length)
  }
}
