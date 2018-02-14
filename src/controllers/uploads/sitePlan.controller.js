'use strict'

const BaseUploadEvidenceController = require('./baseUploadEvidence.controller')
const SitePlan = require('../../models/taskList/sitePlan.model')
const Constants = require('../../constants')
const {SITE_PLAN} = Constants.UploadSubject

module.exports = class SitePlanController extends BaseUploadEvidenceController {
  get subject () {
    return SITE_PLAN
  }

  get view () {
    return 'uploads/sitePlan'
  }

  async updateCompleteness (...args) {
    await SitePlan.updateCompleteness(...args)
  }
}
