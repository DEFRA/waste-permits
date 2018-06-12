'use strict'

const Constants = require('../../../constants')
const AddressManualController = require('../base/addressManual.controller')
const PermitHolderDetails = require('../../../models/taskList/permitHolderDetails.model')

module.exports = class AddressManualPermitHolderController extends AddressManualController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PERMIT_HOLDER_POSTCODE
  }

  getModel () {
    return PermitHolderDetails
  }

  getNextRoute () {
    return Constants.Routes.PERMIT_HOLDER.COMPANY_DECLARE_OFFENCES.path
  }
}
