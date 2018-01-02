'use strict'

const BaseUploadEvidenceController = require('./baseUploadEvidence.controller')
const TechnicalQualification = require('../models/taskList/technicalQualification.model')

module.exports = class UploadDeemedEvidenceController extends BaseUploadEvidenceController {
  getSpecificPageContext () {
    return {
      isDeemedEvidence: true,
      subject: 'Deemed Evidence'
    }
  }

  async updateCompleteness (...args) {
    await TechnicalQualification.updateCompleteness(...args)
  }
}
