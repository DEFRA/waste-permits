'use strict'

const Constants = require('../../../constants')
const AddressSelectController = require('../base/addressSelect.controller')
const SiteNameAndLocation = require('../../../models/taskList/siteNameAndLocation.model')

module.exports = class AddressSelectSiteController extends AddressSelectController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.SITE_POSTCODE
  }

  getManualEntryRoute () {
    return Constants.Routes.ADDRESS.MANUAL_SITE.path
  }

  getPostcodeRoute () {
    return Constants.Routes.ADDRESS.POSTCODE_SITE.path
  }

  getModel () {
    return SiteNameAndLocation
  }

  getNextRoute () {
    return Constants.Routes.TASK_LIST.path
  }
}
