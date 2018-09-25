'use strict'

const Constants = require('../../../constants')
const Routes = require('../../../routes')
const AddressSelectController = require('../base/addressSelect.controller')
const PublicBodyDetails = require('../../../models/taskList/publicBodyDetails.model')

module.exports = class AddressSelectPermitHolderController extends AddressSelectController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PUBLIC_BODY_POSTCODE
  }

  getManualEntryRoute () {
    return Routes.MANUAL_PUBLIC_BODY.path
  }

  getPostcodeRoute () {
    return Routes.POSTCODE_PUBLIC_BODY.path
  }

  getModel () {
    return PublicBodyDetails
  }
}
