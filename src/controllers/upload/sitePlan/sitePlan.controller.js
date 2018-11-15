'use strict'

const UploadController = require('../base/upload.controller')
const Constants = require('../../../constants')
const { SITE_PLAN } = Constants.UploadSubject

module.exports = class SitePlanController extends UploadController {
  get subject () {
    return SITE_PLAN
  }
}
