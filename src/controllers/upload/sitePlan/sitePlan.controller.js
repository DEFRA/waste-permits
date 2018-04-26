'use strict'

const UploadController = require('../base/upload.controller')
const SitePlan = require('../../../models/taskList/sitePlan.model')
const Constants = require('../../../constants')
const {SITE_PLAN} = Constants.UploadSubject

module.exports = class SitePlanController extends UploadController {
  get subject () {
    return SITE_PLAN
  }

  async updateCompleteness (...args) {
    await SitePlan.updateCompleteness(...args)
  }
}
