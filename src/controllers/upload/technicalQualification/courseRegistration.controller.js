'use strict'

const UploadController = require('../base/upload.controller')
const TechnicalQualification = require('../../../models/taskList/technicalQualification.model')
const Constants = require('../../../constants')
const {TECHNICAL_QUALIFICATION} = Constants.UploadSubject

module.exports = class CourseRegistrationController extends UploadController {
  get subject () {
    return TECHNICAL_QUALIFICATION
  }

  get view () {
    return 'upload/technicalQualification/courseRegistration'
  }

  async updateCompleteness (...args) {
    await TechnicalQualification.updateCompleteness(...args)
  }
}
