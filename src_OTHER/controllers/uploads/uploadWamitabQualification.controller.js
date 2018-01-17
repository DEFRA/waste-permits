'use strict'

const BaseUploadEvidenceController = require('./baseUploadEvidence.controller')
const TechnicalQualification = require('../../models/taskList/technicalQualification.model')

module.exports = class UploadWamitabQualificationController extends BaseUploadEvidenceController {
  getSpecificPageContext () {
    return {
      isWamitabQualification: true,
      subject: 'WAMITAB certificate'
    }
  }

  async updateCompleteness (...args) {
    await TechnicalQualification.updateCompleteness(...args)
  }
}
