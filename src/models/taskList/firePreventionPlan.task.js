'use strict'

const Constants = require('../../constants')
const { FIRE_PREVENTION_PLAN } = require('./taskList').CompletedParameters
const BaseTask = require('./base.task')
const Annotation = require('../../persistence/entities/annotation.entity')

module.exports = class FirePreventionPlan extends BaseTask {
  static get completenessParameter () {
    return FIRE_PREVENTION_PLAN
  }

  static async checkComplete (context, applicationId) {
    const evidence = await Annotation.listByApplicationIdAndSubject(context, applicationId, Constants.UploadSubject.FIRE_PREVENTION_PLAN)
    return Boolean(evidence.length)
  }
}
