'use strict'

const Constants = require('../../../constants')
const Routes = require('../../../routes')
const PostcodeController = require('../base/postcode.controller')
const PublicBodyDetails = require('../../../models/taskList/publicBodyDetails.task')

module.exports = class PostcodePublicBodyController extends PostcodeController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PUBLIC_BODY_POSTCODE
  }

  getManualEntryPath () {
    return Routes.MANUAL_PUBLIC_BODY.path
  }

  getAddressSelectionPath () {
    return Routes.SELECT_PUBLIC_BODY.path
  }

  get task () {
    return PublicBodyDetails
  }
}
