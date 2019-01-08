'use strict'

const Constants = require('../../../constants')
const Routes = require('../../../routes')
const AddressSelectController = require('../base/addressSelect.controller')
const SiteNameAndLocation = require('../../../models/taskList/siteNameAndLocation.task')

module.exports = class AddressSelectSiteController extends AddressSelectController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.SITE_POSTCODE
  }

  getManualEntryPath () {
    return Routes.MANUAL_SITE.path
  }

  getPostcodePath () {
    return Routes.POSTCODE_SITE.path
  }

  get task () {
    return SiteNameAndLocation
  }
}
