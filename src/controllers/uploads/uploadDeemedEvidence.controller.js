'use strict'

const BaseUploadEvidenceController = require('./baseUploadEvidence.controller')
const TechnicalQualification = require('../../models/taskList/technicalQualification.model')
const Constants = require('../../constants')
const {TECHNICAL_QUALIFICATION} = Constants.UploadSubject

module.exports = class UploadDeemedEvidenceController extends BaseUploadEvidenceController {
  get subject () {
    return TECHNICAL_QUALIFICATION
  }

  get view () {
    return 'uploads/deemedEvidence'
  }

  async updateCompleteness (...args) {
    await TechnicalQualification.updateCompleteness(...args)
  }
}
