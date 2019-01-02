'use strict'

const Constants = require('../../../constants')
const Routes = require('../../../routes')
const AddressSelectController = require('../base/addressSelect.controller')
const PublicBodyDetails = require('../../../models/taskList/publicBodyDetails.task')

module.exports = class AddressSelectPublicBodyController extends AddressSelectController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PUBLIC_BODY_POSTCODE
  }

  getManualEntryPath () {
    return Routes.MANUAL_PUBLIC_BODY.path
  }

  getPostcodePath () {
    return Routes.POSTCODE_PUBLIC_BODY.path
  }

  getModel () {
    return PublicBodyDetails
  }
}
