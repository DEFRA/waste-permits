'use strict'

const Constants = require('../../../constants')
const AddressManualController = require('../base/addressManual.controller')
const SiteNameAndLocation = require('../../../models/taskList/siteNameAndLocation.model')

module.exports = class AddressManualSiteController extends AddressManualController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.SITE_POSTCODE
  }

  getModel () {
    return SiteNameAndLocation
  }
}
