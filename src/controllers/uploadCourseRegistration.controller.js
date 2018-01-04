'use strict'

const BaseUploadEvidenceController = require('./baseUploadEvidence.controller')
const TechnicalQualification = require('../models/taskList/technicalQualification.model')

module.exports = class UploadCourseRegistrationController extends BaseUploadEvidenceController {
  getSpecificPageContext () {
    return {
      isCourseRegistration: true,
      subject: 'Course registration'
    }
  }

  async updateCompleteness (...args) {
    await TechnicalQualification.updateCompleteness(...args)
  }
}
