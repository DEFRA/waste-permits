'use strict'

const UploadController = require('../base/upload.controller')
const FirePreventionPlan = require('../../../models/taskList/firePreventionPlan.model')
const Constants = require('../../../constants')
const {FIRE_PREVENTION_PLAN} = Constants.UploadSubject

module.exports = class FirePlanController extends UploadController {
  get subject () {
    return FIRE_PREVENTION_PLAN
  }

  get view () {
    return 'upload/firePreventionPlan/firePreventionPlan'
  }

  async updateCompleteness (...args) {
    await FirePreventionPlan.updateCompleteness(...args)
  }
}
