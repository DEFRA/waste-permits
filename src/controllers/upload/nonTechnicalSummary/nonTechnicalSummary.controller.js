'use strict'

const UploadController = require('../base/upload.controller')
const Constants = require('../../../constants')
const { NON_TECHNICAL_SUMMARY } = Constants.UploadSubject

module.exports = class NonTechnicalSummaryController extends UploadController {
  get subject () {
    return NON_TECHNICAL_SUMMARY
  }
}
