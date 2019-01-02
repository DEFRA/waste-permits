'use strict'

const Constants = require('../../../constants')
const Routes = require('../../../routes')
const PostcodeController = require('../base/postcode.controller')
const SiteNameAndLocation = require('../../../models/taskList/siteNameAndLocation.task')

module.exports = class PostcodeInvoiceController extends PostcodeController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.SITE_POSTCODE
  }

  getManualEntryPath () {
    return Routes.MANUAL_SITE.path
  }

  getAddressSelectionPath () {
    return Routes.SELECT_SITE.path
  }

  getModel () {
    return SiteNameAndLocation
  }

  customisePageContext (pageContext) {
    // Not required for this address type
  }
}
