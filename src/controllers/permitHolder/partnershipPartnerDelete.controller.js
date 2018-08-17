'use strict'

const Handlebars = require('handlebars')
const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')
const CryptoService = require('../../services/crypto.service')
const AddressDetail = require('../../models/addressDetail.model')
const ApplicationContact = require('../../models/applicationContact.model')
const PermitHolderDetails = require('../../models/taskList/permitHolderDetails.model')
const Contact = require('../../models/contact.model')

module.exports = class PartnershipPartnerDeleteController extends BaseController {
  async doGet (request, h) {
    let { partnerId } = request.params

    const applicationContactId = CryptoService.decrypt(partnerId)
    const context = await RecoveryService.createApplicationContext(h)
    const applicationContact = await ApplicationContact.getById(context, applicationContactId)
    const { firstName, lastName } = await Contact.getById(context, applicationContact.contactId)
    this.route.pageHeading = Handlebars.compile(this.orginalPageHeading)({
      name: `${firstName} ${lastName}`
    })

    const pageContext = this.createPageContext(request)
    pageContext.skipDeletePartnerLink = this.nextPath

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h, { account: true })
    const { applicationId, applicationLineId, account: partnership } = context
    let { partnerId } = request.params
    const applicationContactId = CryptoService.decrypt(partnerId)
    const applicationContact = await ApplicationContact.getById(context, applicationContactId)
    if (applicationContact) {
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
    }
    return this.redirect({ request, h, redirectPath: this.nextPath })
  }
}
