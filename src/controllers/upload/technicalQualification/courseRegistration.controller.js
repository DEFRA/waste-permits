'use strict'

const UploadController = require('../base/upload.controller')
const RecoveryService = require('../../../services/recovery.service')
const Constants = require('../../../constants')
const {TECHNICAL_QUALIFICATION} = Constants.UploadSubject

module.exports = class CourseRegistrationController extends UploadController {
  get subject () {
    return TECHNICAL_QUALIFICATION
  }

  async getSpecificPageContext (h) {
    const {standardRule} = await RecoveryService.createApplicationContext(h, {standardRule: true})
    const {MEDIUM, HIGH} = Constants.Dynamics.WamitabRiskLevel
    return {
      wamitabRiskIsMediumOrHigh: [MEDIUM, HIGH].includes(standardRule.wamitabRiskLevel)
    }
  }
}
