'use strict'

const BaseController = require('../../base.controller')
const RecoveryService = require('../../../services/recovery.service')
const PermitHolderDetails = require('../../../models/taskList/permitHolderDetails.task')

module.exports = class MemberDeleteController extends BaseController {
  async doGet (request, h) {
    const contactDetail = await this.task.getContactDetail(request)

    if (!contactDetail) {
      throw new Error('Member details not found')
    }

    this.route.pageHeading = await this.task.getPageHeading(request, this.orginalPageHeading)

    const pageContext = this.createPageContext(h)
    pageContext.skipDeleteMemberLink = this.nextPath
    pageContext.deleteButtonTitle = this.route.deleteButtonTitle

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h, { account: true })
    const contactDetail = await this.task.getContactDetail(request)

    if (!contactDetail) {
      throw new Error('Member details not found')
    }

    await contactDetail.delete(context)

    // Clear the completeness flag here to force applicant to complete permit holder task
    await PermitHolderDetails.clearCompleteness(context)
    return this.redirect({ h })
  }
}
