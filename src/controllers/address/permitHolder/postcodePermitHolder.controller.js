'use strict'

const Constants = require('../../../constants')
const Routes = require('../../../routes')
const PostcodeController = require('../base/postcode.controller')
const PermitHolderDetails = require('../../../models/taskList/permitHolderDetails.task')

module.exports = class PostcodePermitHolderController extends PostcodeController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PERMIT_HOLDER_POSTCODE
  }

  getManualEntryPath () {
    return Routes.MANUAL_PERMIT_HOLDER.path
  }

  getAddressSelectionPath () {
    return Routes.SELECT_PERMIT_HOLDER.path
  }

  get task () {
    return PermitHolderDetails
  }

  async customisePageContext (pageContext, request) {
    pageContext.showCharitySubheading = this.task.isCharity(request)
  }
}
