'use strict'

const Constants = require('../../../constants')
const AddressManualController = require('../base/addressManual.controller')
const PartnerDetails = require('../../../models/taskList/partnerDetails.model')

module.exports = class AddressManualPartnerController extends AddressManualController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PARTNER_POSTCODE
  }

  getModel () {
    return PartnerDetails
  }

  async customisePageContext (pageContext, context) {
    const pageHeading = await this.getModel().getPageHeading(context, pageContext.pageHeading)
    pageContext.pageHeading = pageHeading
    pageContext.pageTitle = Constants.buildPageTitle(pageHeading)
  }
}
