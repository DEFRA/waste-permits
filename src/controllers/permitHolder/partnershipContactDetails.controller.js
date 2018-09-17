'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const Contact = require('../../models/contact.model')
const AddressDetail = require('../../models/addressDetail.model')
const PartnerDetails = require('../../models/taskList/partnerDetails.model')

const { TECHNICAL_PROBLEM, POSTCODE_PARTNER } = require('../../routes')

module.exports = class PartnershipContactDetailsController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const applicationContact = await PartnerDetails.getApplicationContact(request)

    if (!applicationContact) {
      return this.redirect({ request, h, redirectPath: TECHNICAL_PROBLEM.path })
    }

    this.route.pageHeading = await PartnerDetails.getPageHeading(request, this.orginalPageHeading)
    const pageContext = this.createPageContext(request, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {}
      const { applicationId } = context

      const addressDetail = await AddressDetail.getPartnerDetails(context, applicationId, applicationContact.contactId)
      const { email, telephone } = addressDetail

      Object.assign(pageContext.formValues, { email, telephone })
    }

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, { account: true })
      const applicationContact = await PartnerDetails.getApplicationContact(request)

      if (!applicationContact) {
        return this.redirect({ request, h, redirectPath: TECHNICAL_PROBLEM.path })
      }

      let contact = await Contact.getById(context, applicationContact.contactId)
      const { applicationId, account: partnership } = context
      const {
        email,
        telephone
      } = request.payload

      const partnerDetails = await AddressDetail.getPartnerDetails(context, applicationId, applicationContact.contactId)

      let { firstName, lastName } = contact
      const matchingContact = await Contact.getByFirstnameLastnameEmail(context, firstName, lastName, email)
      if (matchingContact && matchingContact.id !== contact.id) {
        // replace contact in partnerDetails with actual contact
        contact = matchingContact
        partnerDetails.customerId = contact.id
        applicationContact.contactId = contact.id
        await applicationContact.save(context)
      }

      // Save email and telephone
      partnerDetails.email = email
      partnerDetails.telephone = telephone
      await partnerDetails.save(context)

      // Link the contact with the partnership if it isn't already
      const linkedAccounts = await contact.listLinked(context, partnership)
      const link = linkedAccounts.find((account) => account.id === partnership.id)

      if (!link) {
        await contact.link(context, partnership)
      }

      return this.redirect({ request, h, redirectPath: `${POSTCODE_PARTNER.path}/${request.params.partnerId}` })
    }
  }
}
