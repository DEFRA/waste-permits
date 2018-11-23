'use strict'

const UploadController = require('../base/upload.controller')
const Constants = require('../../../constants')
const { ENVIRONMENTAL_RISK_ASSESSMENT } = Constants.UploadSubject

module.exports = class EnvironmentalRiskAssessmentController extends UploadController {
  get subject () {
    return ENVIRONMENTAL_RISK_ASSESSMENT
  }
}
