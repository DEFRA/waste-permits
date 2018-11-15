'use strict'

const UploadController = require('../base/upload.controller')
const Constants = require('../../../constants')
const { FIRE_PREVENTION_PLAN } = Constants.UploadSubject

module.exports = class FirePlanController extends UploadController {
  get subject () {
    return FIRE_PREVENTION_PLAN
  }
}
