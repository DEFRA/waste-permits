'use strict'

const Constants = require('../../../constants')
const Routes = require('../../../routes')
const PostcodeController = require('../base/postcode.controller')
const PermitHolderDetails = require('../../../models/taskList/permitHolderDetails.model')

module.exports = class PostcodePermitHolderController extends PostcodeController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PERMIT_HOLDER_POSTCODE
  }

  getManualEntryRoute () {
    return Routes.MANUAL_PERMIT_HOLDER.path
  }

  getAddressSelectionPath () {
    return Routes.SELECT_PERMIT_HOLDER.path
  }

  getModel () {
    return PermitHolderDetails
  }

  customisePageContext (pageContext) {
    // Not required for this address type
  }
}
