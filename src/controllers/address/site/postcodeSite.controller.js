'use strict'

const Constants = require('../../../constants')
const PostcodeController = require('../base/postcode.controller')
const SiteNameAndLocation = require('../../../models/taskList/siteNameAndLocation.model')

module.exports = class PostcodeInvoiceController extends PostcodeController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.SITE_POSTCODE
  }

  getManualEntryRoute () {
    return Constants.Routes.MANUAL_SITE.path
  }

  getAddressSelectionPath () {
    return Constants.Routes.SELECT_SITE.path
  }

  getModel () {
    return SiteNameAndLocation
  }

  customisePageContext (pageContext) {
    // Not required for this address type
  }
}
