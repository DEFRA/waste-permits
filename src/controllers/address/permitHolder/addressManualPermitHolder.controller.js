'use strict'

const Constants = require('../../../constants')
const AddressManualController = require('../base/addressManual.controller')
const PermitHolderDetails = require('../../../models/taskList/permitHolderDetails.task')

module.exports = class AddressManualPermitHolderController extends AddressManualController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PERMIT_HOLDER_POSTCODE
  }

  getModel () {
    return PermitHolderDetails
  }
}
