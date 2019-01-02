'use strict'

const Constants = require('../../../constants')
const Routes = require('../../../routes')
const PostcodeController = require('../base/postcode.controller')
const PartnerDetails = require('../../../models/taskList/partnerDetails.task')

module.exports = class PostcodePartnerController extends PostcodeController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PARTNER_POSTCODE
  }

  getManualEntryPath (params) {
    return `${Routes.MANUAL_PARTNER.path}/${params.partnerId}`
  }

  getAddressSelectionPath (params) {
    return `${Routes.SELECT_PARTNER.path}/${params.partnerId}`
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
