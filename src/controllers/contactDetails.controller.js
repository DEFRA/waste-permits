'use strict'

const Routes = require('../routes')
const BaseController = require('./base.controller')
const Account = require('../persistence/entities/account.entity')
const ContactDetail = require('../models/contactDetail.model')
const RecoveryService = require('../services/recovery.service')
const { PRIMARY_CONTACT_DETAILS } = require('../dynamics').AddressTypes

module.exports = class ContactDetailsController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h, { application: true })
    const { application } = context

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const type = PRIMARY_CONTACT_DETAILS.TYPE
      const contactDetail = await ContactDetail.get(context, { type })
      if (contactDetail) {
        pageContext.formValues = {
          'first-name': contactDetail.firstName,
          'last-name': contactDetail.lastName,
          'telephone': contactDetail.telephone,
          'email': contactDetail.email
        }
        if (application.agentId) {
          const account = await Account.getById(context, application.agentId)
          pageContext.formValues['is-contact-an-agent'] = true
          pageContext.formValues['agent-company'] = account.accountName
        }
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h, { application: true })
    const { applicationId, application } = context
    const {
      'first-name': firstName,
      'last-name': lastName,
      'is-contact-an-agent': isAgent,
      'agent-company': agentCompany,
      telephone,
      email
    } = request.payload

    const type = PRIMARY_CONTACT_DETAILS.TYPE
    const contactDetail = (await ContactDetail.get(context, { type })) || new ContactDetail({ applicationId, type })

    Object.assign(contactDetail, { firstName, lastName, telephone, email })
    await contactDetail.save(context)

    // The agent company or trading name is only set if the corresponding checkbox is ticked
    if (isAgent) {
      const account = application.agentId ? await Account.getById(context, application.agentId) : new Account()
      account.accountName = agentCompany
      await account.save(context)
      application.agentId = account.id
    } else {
      application.agentId = undefined
    }

    application.contactId = contactDetail.customerId
    await application.save(context)

    return this.redirect({ h, route: Routes.TASK_LIST })
  }
}
