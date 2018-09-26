'use strict'

const Constants = require('../../constants')
const { WASTE_RECOVERY_PLAN } = require('../taskList/taskList.model').CompletedParameters
const Completeness = require('./completeness.model')
const Annotation = require('../annotation.model')

module.exports = class WasteRecoveryPlan extends Completeness {
  static get completenessParameter () {
    return WASTE_RECOVERY_PLAN
  }

  static async checkComplete (context, applicationId) {
    const evidence = await Annotation.listByApplicationIdAndSubject(context, applicationId, Constants.UploadSubject.WASTE_RECOVERY_PLAN)
    return Boolean(evidence.length)
  }
}
