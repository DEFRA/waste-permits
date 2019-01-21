'use strict'

const Constants = require('../../../constants')
const Routes = require('../../../routes')
const PostcodeController = require('../base/postcode.controller')
const PartnerDetails = require('../../../models/taskList/partnerDetails.task')

module.exports = class PostcodePostHolderController extends PostcodeController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PARTNER_POSTCODE
  }

  getManualEntryPath (params) {
    return `${Routes.MANUAL_POST_HOLDER.path}/${params.partnerId}`
  }

  getAddressSelectionPath (params) {
    return `${Routes.SELECT_POST_HOLDER.path}/${params.partnerId}`
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
