'use strict'

const BaseUploadEvidenceController = require('./baseUploadEvidence.controller')
const TechnicalQualification = require('../models/taskList/technicalQualification.model')

module.exports = class UploadDeemedEvidenceController extends BaseUploadEvidenceController {
  getSpecificPageContext () {
    return {
      isEsaEuSkills: true,
      subject: 'ESA EU Skills'
    }
  }

  async updateCompleteness (...args) {
    await TechnicalQualification.updateCompleteness(...args)
  }
}
