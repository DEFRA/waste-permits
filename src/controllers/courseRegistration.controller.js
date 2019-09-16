'use strict'

const UploadController = require('./upload.controller')
const RecoveryService = require('../services/recovery.service')
const { WamitabRiskLevel: { MEDIUM, HIGH } } = require('../dynamics')

module.exports = class CourseRegistrationController extends UploadController {
  async getSpecificPageContext (h) {
    const { isBespoke, standardRule } = await RecoveryService.createApplicationContext(h, { standardRule: true })
    const specificPageContext = { wamitabRiskIsMediumOrHigh: false }

    if (isBespoke) {
      // TODO: Find out how the risk level is determined for bespoke
      specificPageContext.wamitabRiskIsMediumOrHigh = true
    } else {
      specificPageContext.wamitabRiskIsMediumOrHigh = [MEDIUM, HIGH].includes(standardRule.wamitabRiskLevel)
    }

    return specificPageContext
  }
}
