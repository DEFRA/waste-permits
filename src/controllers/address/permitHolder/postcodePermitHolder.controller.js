'use strict'

const Constants = require('../../../constants')
const PostcodeController = require('../base/postcode.controller')
const Contact = require('../../../models/contact.model')

module.exports = class PostcodePermitHolderController extends PostcodeController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PERMIT_HOLDER_POSTCODE
  }

  getManualEntryRoute () {
    return Constants.Routes.ADDRESS.MANUAL_PERMIT_HOLDER.path
  }

  getAddressSelectionPath () {
    return Constants.Routes.ADDRESS.SELECT_PERMIT_HOLDER.path
  }

  getModel () {
    return Contact
  }

  customisePageContext (pageContext) {
    // Not required for this address type
  }
}
