'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const PartnerDetails = require('../../models/taskList/partnerDetails.task')
const PermitHolderDetails = require('../../models/taskList/permitHolderDetails.task')

const { TECHNICAL_PROBLEM } = require('../../routes')

module.exports = class PartnershipPartnerDeleteController extends BaseController {
  async doGet (request, h) {
    const contactDetail = await PartnerDetails.getContactDetail(request)

    if (!contactDetail) {
      return this.redirect({ h, route: TECHNICAL_PROBLEM })
    }

    this.route.pageHeading = await PartnerDetails.getPageHeading(request, this.orginalPageHeading)

    const pageContext = this.createPageContext(h)
    pageContext.skipDeletePartnerLink = this.nextPath
    pageContext.deleteButtonTitle = this.route.deleteButtonTitle

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h, { account: true })
    const contactDetail = await PartnerDetails.getContactDetail(request)

    if (!contactDetail) {
      return this.redirect({ h, route: TECHNICAL_PROBLEM })
    }

    await contactDetail.delete(context)

    // Clear the completeness flag here to force applicant to complete permit holder task
    await PermitHolderDetails.clearCompleteness(context)
    return this.redirect({ h })
  }
}
