'use strict'

const Constants = require('../../../constants')
const Routes = require('../../../routes')
const AddressSelectController = require('../base/addressSelect.controller')
const SiteNameAndLocation = require('../../../models/taskList/siteNameAndLocation.model')

module.exports = class AddressSelectSiteController extends AddressSelectController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.SITE_POSTCODE
  }

  getManualEntryRoute () {
    return Routes.MANUAL_SITE.path
  }

  getPostcodeRoute () {
    return Routes.POSTCODE_SITE.path
  }

  getModel () {
    return SiteNameAndLocation
  }
}
