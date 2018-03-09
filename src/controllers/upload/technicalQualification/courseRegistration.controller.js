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

  async getSpecificPageContext (request) {
    const {standardRule} = await this.createApplicationContext(request, {standardRule: true})
    const {MEDIUM, HIGH} = Constants.Dynamics.WamitabRiskLevel
    return {
      wamitabRiskIsMediumOrHigh: [MEDIUM, HIGH].includes(standardRule.wamitabRiskLevel)
    }
  }

  async updateCompleteness (...args) {
    await TechnicalQualification.updateCompleteness(...args)
  }
}
