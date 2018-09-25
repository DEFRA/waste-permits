'use strict'

const Constants = require('../../../constants')
const Routes = require('../../../routes')
const PostcodeController = require('../base/postcode.controller')
const PublicBodyDetails = require('../../../models/taskList/publicBodyDetails.model')

module.exports = class PostcodePermitHolderController extends PostcodeController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PUBLIC_BODY_POSTCODE
  }

  getManualEntryRoute () {
    return Routes.MANUAL_PUBLIC_BODY.path
  }

  getAddressSelectionPath () {
    return Routes.SELECT_PUBLIC_BODY.path
  }

  getModel () {
    return PublicBodyDetails
  }

  customisePageContext (pageContext) {
    // Not required for this address type
  }
}
