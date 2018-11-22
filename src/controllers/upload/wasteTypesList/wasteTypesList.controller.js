'use strict'

const UploadController = require('../base/upload.controller')
const Constants = require('../../../constants')
const { WASTE_TYPES_LIST } = Constants.UploadSubject

module.exports = class WasteTypesListController extends UploadController {
  get subject () {
    return WASTE_TYPES_LIST
  }
}
