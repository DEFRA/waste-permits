'use strict'

const Constants = require('../../../constants')
const PostcodeController = require('../base/postcode.controller')
const PermitHolderDetails = require('../../../models/taskList/permitHolderDetails.model')

module.exports = class PostcodePermitHolderController extends PostcodeController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PERMIT_HOLDER_POSTCODE
  }

  getManualEntryRoute () {
    return Constants.Routes.MANUAL_PERMIT_HOLDER.path
  }

  getAddressSelectionPath () {
    return Constants.Routes.SELECT_PERMIT_HOLDER.path
  }

  getModel () {
    return PermitHolderDetails
  }

  customisePageContext (pageContext) {
    // Not required for this address type
  }
}
