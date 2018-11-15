'use strict'

const UploadController = require('../base/upload.controller')
const Constants = require('../../../constants')
const { TECHNICAL_MANAGERS } = Constants.UploadSubject

module.exports = class TechnicalManagersController extends UploadController {
  get subject () {
    return TECHNICAL_MANAGERS
  }

  async getSpecificPageContext (h, pageContext) {
    return {
      fileTypesHidden: !pageContext.annotations.length
    }
  }
}
