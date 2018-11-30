'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')
const CryptoService = require('../../services/crypto.service')
const ContactDetail = require('../../models/contactDetail.model')
const Utilities = require('../../utilities/utilities')

const { PARTNER_CONTACT_DETAILS } = require('../../dynamics').AddressTypes
const { PARTNERSHIP_NAME_AND_DATE_OF_BIRTH, PARTNERSHIP_PARTNER_LIST, PARTNERSHIP_DELETE_PARTNER } = require('../../routes')

const minPartners = 2
const addPartnerParam = 'add'
const addButtonTitle = 'Add another partner'
const submitButtonTitle = 'All partners added - continue'

module.exports = class PartnershipPartnerListController extends BaseController {
  async createPartner (context) {
    const { applicationId } = context
    // Create an empty Contact Detail
    const contactDetail = new ContactDetail({ applicationId, type: PARTNER_CONTACT_DETAILS.TYPE })
    const contactDetailId = await contactDetail.save(context)
    return CryptoService.encrypt(contactDetailId)
  }

  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    const context = await RecoveryService.createApplicationContext(h, { account: true })
    const { addAnotherPartner } = request.params

    // Get a list of partners associated with this application
    const list = await ContactDetail.list(context, { type: PARTNER_CONTACT_DETAILS.TYPE })

    const contactDetails = await Promise.all(list.map(async (contactDetail) => {
      const { id, dateOfBirth, firstName, lastName, email, telephone, fullAddress } = contactDetail
      if (id && dateOfBirth) {
        const name = `${firstName} ${lastName}`
        const [year, month, day] = dateOfBirth.split('-')
        const partnerId = CryptoService.encrypt(id)
        const dob = Utilities.formatDate({ year, month, day })
        if (fullAddress) {
          const changeLink = `${PARTNERSHIP_NAME_AND_DATE_OF_BIRTH.path}/${partnerId}`
          const deleteLink = `${PARTNERSHIP_DELETE_PARTNER.path}/${partnerId}`
          return { partnerId, name, email, telephone, dob, changeLink, deleteLink, fullAddress }
        }
      }
      // Remove any incomplete partners
      await contactDetail.delete(context)
      return false
    }))

    // Filter out the incomplete partners
    pageContext.partners = contactDetails.filter((partner) => partner)

    // Redirect to adding a new partner if the suffix "/add" is on the url or there are no partners or there are incomplete partners for this application
    if (addAnotherPartner === addPartnerParam || !pageContext.partners.length) {
      const partnerId = await this.createPartner(context)

      return this.redirect({ request, h, redirectPath: `${PARTNERSHIP_NAME_AND_DATE_OF_BIRTH.path}/${partnerId}` })
    }

    if (pageContext.partners.length < minPartners) {
      pageContext.submitButtonTitle = addButtonTitle
    } else {
      pageContext.addAnotherPartnerLink = `${PARTNERSHIP_PARTNER_LIST.path}/${addPartnerParam}`
      pageContext.addButtonTitle = addButtonTitle
      pageContext.submitButtonTitle = submitButtonTitle
    }

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const list = await ContactDetail.list(context, { type: PARTNER_CONTACT_DETAILS.TYPE })
    if (list.length < minPartners) {
      // In this case the submit button would have been labeled "Add another Partner"
      const partnerId = await this.createPartner(context)
      return this.redirect({ request, h, redirectPath: `${PARTNERSHIP_NAME_AND_DATE_OF_BIRTH.path}/${partnerId}` })
    }

    // In this case the submit button would have been labeled "All Partners added - continue"
    // Adding another partner is still possible by clicking the "Add another Partner" link in the page
    return this.redirect({ request, h, redirectPath: this.nextPath })
  }
}
