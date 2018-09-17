'use strict'

const Constants = require('../../../constants')
const Routes = require('../../../routes')
const AddressSelectController = require('../base/addressSelect.controller')
const PartnerDetails = require('../../../models/taskList/partnerDetails.model')

module.exports = class AddressSelectPartnerController extends AddressSelectController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PARTNER_POSTCODE
  }

  getManualEntryRoute (params) {
    return `${Routes.MANUAL_PARTNER.path}/${params.partnerId}`
  }

  getPostcodeRoute (params) {
    return `${Routes.POSTCODE_PARTNER.path}/${params.partnerId}`
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
