'use strict'

const Constants = require('../../../constants')
const Routes = require('../../../routes')
const AddressSelectController = require('../base/addressSelect.controller')
const PermitHolderDetails = require('../../../models/taskList/permitHolderDetails.task')

module.exports = class AddressSelectPermitHolderController extends AddressSelectController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PERMIT_HOLDER_POSTCODE
  }

  getManualEntryPath () {
    return Routes.MANUAL_PERMIT_HOLDER.path
  }

  getPostcodePath () {
    return Routes.POSTCODE_PERMIT_HOLDER.path
  }

  getModel () {
    return PermitHolderDetails
  }
}
