'use strict'

const UploadController = require('../base/upload.controller')
const Constants = require('../../../constants')
const { MANAGEMENT_SYSTEM_SUMMARY } = Constants.UploadSubject

module.exports = class ManagementSystemSummaryController extends UploadController {
  get subject () {
    return MANAGEMENT_SYSTEM_SUMMARY
  }
}
