'use strict'

const Constants = require('../../../constants')
const AddressManualController = require('../base/addressManual.controller')
const Contact = require('../../../models/contact.model')

module.exports = class AddressManualPermitHolderController extends AddressManualController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PERMIT_HOLDER_POSTCODE
  }

  getModel () {
    return Contact
  }

  getNextRoute () {
    return Constants.Routes.COMPANY_DECLARE_OFFENCES.path
  }
}
