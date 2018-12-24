'use strict'

const Constants = require('../../../constants')
const AddressManualController = require('../base/addressManual.controller')
const PartnerDetails = require('../../../models/taskList/partnerDetails.task')

module.exports = class AddressManualPartnerController extends AddressManualController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PARTNER_POSTCODE
  }

  get task () {
    return PartnerDetails
  }

  async customisePageContext (pageContext, request) {
    const pageHeading = await this.task.getPageHeading(request, pageContext.pageHeading)
    pageContext.pageHeading = pageHeading
    pageContext.pageTitle = Constants.buildPageTitle(pageHeading)
  }
}
