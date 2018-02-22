'use strict'

const UploadController = require('../base/upload.controller')
const StandardRule = require('../../../models/standardRule.model')
const TechnicalQualification = require('../../../models/taskList/technicalQualification.model')
const CookieService = require('../../../services/cookie.service')
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
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationLineId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_LINE_ID)
    const standardRule = await StandardRule.getByApplicationLineId(authToken, applicationLineId)
    const {MEDIUM, HIGH} = Constants.Dynamics.WamitabRiskLevel
    return {
      wamitabRiskIsMediumOrHigh: [MEDIUM, HIGH].includes(standardRule.wamitabRiskLevel)
    }
  }

  async updateCompleteness (...args) {
    await TechnicalQualification.updateCompleteness(...args)
  }
}
