'use strict'

const UploadController = require('./upload.controller')
const RecoveryService = require('../services/recovery.service')
const { WamitabRiskLevel } = require('../dynamics')

module.exports = class CourseRegistrationController extends UploadController {
  async getSpecificPageContext (h) {
    const { standardRule } = await RecoveryService.createApplicationContext(h, { standardRule: true })
    const { MEDIUM, HIGH } = WamitabRiskLevel
    return {
      wamitabRiskIsMediumOrHigh: [MEDIUM, HIGH].includes(standardRule.wamitabRiskLevel)
    }
  }
}
