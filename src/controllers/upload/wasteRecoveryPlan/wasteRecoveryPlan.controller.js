'use strict'

const UploadController = require('../base/upload.controller')
const WasteRecoveryPlan = require('../../../models/taskList/wasteRecoveryPlan.task')
const Constants = require('../../../constants')
const { WASTE_RECOVERY_PLAN } = Constants.UploadSubject

module.exports = class WasteRecoveryPlanController extends UploadController {
  get subject () {
    return WASTE_RECOVERY_PLAN
  }

  async updateCompleteness (...args) {
    await WasteRecoveryPlan.updateCompleteness(...args)
  }
}
