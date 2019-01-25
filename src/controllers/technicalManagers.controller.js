'use strict'

const UploadController = require('./upload.controller')

module.exports = class TechnicalManagersController extends UploadController {
  async getSpecificPageContext (h, pageContext) {
    return {
      fileTypesHidden: !pageContext.annotations.length
    }
  }
}
