'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')
const CryptoService = require('../../services/crypto.service')
const Address = require('../../models/address.model')
const AddressDetail = require('../../models/addressDetail.model')
const ApplicationContact = require('../../models/applicationContact.model')
const Contact = require('../../models/contact.model')
const Account = require('../../models/account.model')
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

    const list = await ApplicationContact.listByApplicationId(context, applicationId)

    if (addAnotherPartner === addPartnerParam || !list.length) {
      const partnerId = await this.createPartner(context, application.id)

      return this.redirect({ request, h, redirectPath: `${PARTNERSHIP_NAME_AND_DATE_OF_BIRTH.path}/${partnerId}` })
    }

    pageContext.partners = await Promise.all(list.map(async ({ id, contactId, directorDob }) => {
      const { firstName, lastName } = await Contact.getById(context, contactId)
      const name = `${firstName} ${lastName}`
      const [year, month, day] = directorDob.split('-')
      const partnerId = CryptoService.encrypt(id)
      const dob = Utilities.formatDate({ year, month, day })
      const changeLink = `${PARTNERSHIP_NAME_AND_DATE_OF_BIRTH.path}/${partnerId}`
      const deleteLink = `${PARTNERSHIP_DELETE_PARTNER.path}/${partnerId}`
      const { email, telephone, addressId } = await AddressDetail.getPartnerDetails(context, applicationId, contactId)
      const { fullAddress = '' } = await Address.getById(context, addressId)
      return { partnerId, name, email, telephone, dob, changeLink, deleteLink, fullAddress }
    }))

    if (list.length < minPartners) {
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
      const partnerId = await this.createPartner(context, applicationId)
      return this.redirect({ request, h, redirectPath: `${PARTNERSHIP_NAME_AND_DATE_OF_BIRTH.path}/${partnerId}` })
    }

    return this.redirect({ request, h, redirectPath: this.nextPath })
  }
}
