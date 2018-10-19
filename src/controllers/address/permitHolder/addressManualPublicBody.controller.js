'use strict'

const Constants = require('../../../constants')
const AddressManualController = require('../base/addressManual.controller')
const PublicBodyDetails = require('../../../models/taskList/publicBodyDetails.model')

module.exports = class AddressManualPublicBodyController extends AddressManualController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PUBLIC_BODY_POSTCODE
  }

  getModel () {
    return PublicBodyDetails
  }
}
