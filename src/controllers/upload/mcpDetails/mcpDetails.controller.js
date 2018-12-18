'use strict'

const UploadController = require('../base/upload.controller')
const Constants = require('../../../constants')
const { MCP_DETAILS } = Constants.UploadSubject

module.exports = class McpDetailsController extends UploadController {
  get subject () {
    return MCP_DETAILS
  }
}
