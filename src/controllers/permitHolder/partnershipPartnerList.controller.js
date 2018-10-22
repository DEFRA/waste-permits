'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')
const CryptoService = require('../../services/crypto.service')
const Address = require('../../persistence/entities/address.entity')
const AddressDetail = require('../../persistence/entities/addressDetail.entity')
const ApplicationContact = require('../../persistence/entities/applicationContact.entity')
const Contact = require('../../persistence/entities/contact.entity')
const Account = require('../../persistence/entities/account.entity')
const Utilities = require('../../utilities/utilities')

const { PARTNERSHIP_NAME_AND_DATE_OF_BIRTH, PARTNERSHIP_PARTNER_LIST, PARTNERSHIP_DELETE_PARTNER } = require('../../routes')

const minPartners = 2
const addPartnerParam = 'add'
const addButtonTitle = 'Add another partner'
const submitButtonTitle = 'All partners added - continue'

module.exports = class PartnershipPartnerListController extends BaseController {
  async createPartner (context, applicationId) {
    // Create an empty Application Contact
    const applicationContact = new ApplicationContact({ applicationId })
    await applicationContact.save(context)
    return CryptoService.encrypt(applicationContact.id)
  }

  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    const context = await RecoveryService.createApplicationContext(h, { account: true })
    let { application, account, applicationId } = context
    const { addAnotherPartner } = request.params

    // Create an account for this partnership if it doesn't already exist
    if (!account) {
      account = new Account({ organisationType: application.organisationType })
      await account.save(context)
      application.permitHolderOrganisationId = account.id
      await application.save(context)
    }

    // Get a list of partners associated with this application
    const list = await ApplicationContact.listByApplicationId(context, applicationId)

    const partners = await Promise.all(list.map(async (partner) => {
      const { id, contactId, directorDob } = partner
      if (contactId && directorDob) {
        const { firstName, lastName } = await Contact.getById(context, contactId)
        const name = `${firstName} ${lastName}`
        const [year, month, day] = directorDob.split('-')
        const partnerId = CryptoService.encrypt(id)
        const dob = Utilities.formatDate({ year, month, day })
        const addressDetail = await AddressDetail.getPartnerDetails(context, applicationId, contactId)
        if (addressDetail) {
          const { email, telephone, addressId } = addressDetail
          if (addressId) {
            const { fullAddress } = await Address.getById(context, addressId)
            const changeLink = `${PARTNERSHIP_NAME_AND_DATE_OF_BIRTH.path}/${partnerId}`
            const deleteLink = `${PARTNERSHIP_DELETE_PARTNER.path}/${partnerId}`
            return { partnerId, name, email, telephone, dob, changeLink, deleteLink, fullAddress }
          }
        }
      }
      // Remove any incomplete partners
      await partner.delete(context)
      return false
    }))

    // Filter out the incomplete partners
    pageContext.partners = partners.filter((partner) => partner)

    // Redirect to adding a new partner if the suffix "/add" is on the url or there are no partners or there are incomplete partners for this application
    if (addAnotherPartner === addPartnerParam || !pageContext.partners.length) {
      const partnerId = await this.createPartner(context, application.id)

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
    const { applicationId } = context
    const list = await ApplicationContact.listByApplicationId(context, applicationId)
    if (list.length < minPartners) {
      // In this case the submit button would have been labeled "Add another Partner"
      const partnerId = await this.createPartner(context, applicationId)
      return this.redirect({ request, h, redirectPath: `${PARTNERSHIP_NAME_AND_DATE_OF_BIRTH.path}/${partnerId}` })
    }

    // In this case the submit button would have been labeled "All Partners added - continue"
    // Adding another partner is still possible by clicking the "Add another Partner" link in the page
    return this.redirect({ request, h, redirectPath: this.nextPath })
  }
}
