'use strict'

const Constants = require('../../../constants')
const AddressManualController = require('../base/addressManual.controller')
const PublicBodyDetails = require('../../../models/taskList/publicBodyDetails.task')

module.exports = class AddressManualPublicBodyController extends AddressManualController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PUBLIC_BODY_POSTCODE
  }

  get task () {
    return PublicBodyDetails
  }
}
