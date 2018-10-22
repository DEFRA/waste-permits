'use strict'

const Constants = require('../../constants')
const { WASTE_RECOVERY_PLAN } = require('./taskList').CompletedParameters
const BaseTask = require('./base.task')
const Annotation = require('../../persistence/entities/annotation.entity')

module.exports = class WasteRecoveryPlan extends BaseTask {
  static get completenessParameter () {
    return WASTE_RECOVERY_PLAN
  }

  static async checkComplete (context, applicationId) {
    const evidence = await Annotation.listByApplicationIdAndSubject(context, applicationId, Constants.UploadSubject.WASTE_RECOVERY_PLAN)
    return Boolean(evidence.length)
  }
}
