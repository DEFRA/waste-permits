'use strict'

const Constants = require('../../../constants')
const Routes = require('../../../routes')
const AddressSelectController = require('../base/addressSelect.controller')
const PartnerDetails = require('../../../models/taskList/partnerDetails.task')

module.exports = class AddressSelectPostHolderController extends AddressSelectController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.PARTNER_POSTCODE
  }

  getManualEntryPath (params) {
    return `${Routes.MANUAL_POSTHOLDER.path}/${params.partnerId}`
  }

  getPostcodePath (params) {
    return `${Routes.POSTCODE_POSTHOLDER.path}/${params.partnerId}`
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
