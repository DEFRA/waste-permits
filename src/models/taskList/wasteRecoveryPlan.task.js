'use strict'

const Constants = require('../../constants')
const BaseTask = require('./base.task')
const Annotation = require('../../persistence/entities/annotation.entity')

module.exports = class WasteRecoveryPlan extends BaseTask {
  static async checkComplete (context) {
    const { applicationId } = context
    const evidence = await Annotation.listByApplicationIdAndSubject(context, applicationId, Constants.UploadSubject.WASTE_RECOVERY_PLAN)
    return Boolean(evidence.length)
  }
}
