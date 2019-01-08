'use strict'

const Constants = require('../../../constants')
const AddressManualController = require('../base/addressManual.controller')
const PermitHolderDetails = require('../../../models/taskList/permitHolderDetails.task')

module.exports = class AddressManualPermitHolderController extends AddressManualController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PERMIT_HOLDER_POSTCODE
  }

  get task () {
    return PermitHolderDetails
  }

  async customisePageContext (pageContext, request) {
    pageContext.showCharitySubheading = this.task.isCharity(request)
  }
}
