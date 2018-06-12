'use strict'

const Constants = require('../../../constants')
const AddressSelectController = require('../base/addressSelect.controller')
const PermitHolderDetails = require('../../../models/taskList/permitHolderDetails.model')

module.exports = class AddressSelectPermitHolderController extends AddressSelectController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PERMIT_HOLDER_POSTCODE
  }

  getManualEntryRoute () {
    return Constants.Routes.ADDRESS.MANUAL_PERMIT_HOLDER.path
  }

  getPostcodeRoute () {
    return Constants.Routes.ADDRESS.POSTCODE_PERMIT_HOLDER.path
  }

  getModel () {
    return PermitHolderDetails
  }

  getNextRoute () {
    return Constants.Routes.PERMIT_HOLDER.COMPANY_DECLARE_OFFENCES.path
  }
}
