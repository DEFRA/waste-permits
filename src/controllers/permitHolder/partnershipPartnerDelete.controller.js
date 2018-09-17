'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const AddressDetail = require('../../models/addressDetail.model')
const Contact = require('../../models/contact.model')
const PartnerDetails = require('../../models/taskList/partnerDetails.model')
const PermitHolderDetails = require('../../models/taskList/permitHolderDetails.model')

const { TECHNICAL_PROBLEM } = require('../../routes')

module.exports = class PartnershipPartnerDeleteController extends BaseController {
  async doGet (request, h) {
    const applicationContact = await PartnerDetails.getApplicationContact(request)

    if (!applicationContact) {
      return this.redirect({ request, h, redirectPath: TECHNICAL_PROBLEM.path })
    }

    if (!applicationContact) {
      return this.redirect({ request, h, redirectPath: TECHNICAL_PROBLEM.path })
    }

    this.route.pageHeading = await PartnerDetails.getPageHeading(request, this.orginalPageHeading)

    const pageContext = this.createPageContext(request)
    pageContext.skipDeletePartnerLink = this.nextPath

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h, { account: true })
    const { applicationId, applicationLineId, account: partnership } = context
    const applicationContact = await PartnerDetails.getApplicationContact(request)

    if (!applicationContact) {
      return this.redirect({ request, h, redirectPath: TECHNICAL_PROBLEM.path })
    }

    const { contactId } = applicationContact
    const addressDetail = await AddressDetail.getPartnerDetails(context, applicationId, contactId)
    const contact = await Contact.getById(context, contactId)

    // Unlink the contact with the partnership if it isn't already
    const linkedAccounts = await contact.listLinked(context, partnership)
    const link = linkedAccounts.find((account) => account.id === partnership.id)

    if (link) {
      await contact.unLink(context, partnership)
    }

    await addressDetail.delete(context)
    await applicationContact.delete(context)

    // Clear the completeness flag here to force applicant to complete permit holder task
    await PermitHolderDetails.clearCompleteness(context, applicationId, applicationLineId)
    return this.redirect({ request, h, redirectPath: this.nextPath })
  }
}
