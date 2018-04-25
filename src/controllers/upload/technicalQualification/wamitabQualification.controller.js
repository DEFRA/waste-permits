'use strict'

const UploadController = require('../base/upload.controller')
const Constants = require('../../../constants')
const {TECHNICAL_QUALIFICATION} = Constants.UploadSubject

module.exports = class WamitabQualificationController extends UploadController {
  get subject () {
    return TECHNICAL_QUALIFICATION
  }
}
