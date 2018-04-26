'use strict'

const UploadController = require('../base/upload.controller')
const TechnicalQualification = require('../../../models/taskList/technicalQualification.model')
const Constants = require('../../../constants')
const {TECHNICAL_MANAGERS} = Constants.UploadSubject

module.exports = class TechnicalManagersController extends UploadController {
  get subject () {
    return TECHNICAL_MANAGERS
  }

  async getSpecificPageContext () {
    return {
      fileTypesHidden: true
    }
  }

  async updateCompleteness (...args) {
    await TechnicalQualification.updateCompleteness(...args)
  }
}
