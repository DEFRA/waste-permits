'use strict'

const Routes = require('../routes')
const BaseController = require('./base.controller')
const Contact = require('../models/contact.model')
const AddressDetail = require('../models/addressDetail.model')
const Account = require('../models/account.model')
const ContactDetails = require('../models/taskList/contactDetails.model')
const RecoveryService = require('../services/recovery.service')

module.exports = class ContactDetailsController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const context = await RecoveryService.createApplicationContext(h, {application: true})
    const {applicationId, application} = context

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const contact = application.contactId ? await Contact.getById(context, application.contactId) : new Contact()
      const primaryContactDetails = await AddressDetail.getPrimaryContactDetails(context, applicationId)
      if (contact) {
        pageContext.formValues = {
          'first-name': contact.firstName,
          'last-name': contact.lastName,
          'telephone': primaryContactDetails.telephone,
          'email': contact.email
        }
        if (application.agentId) {
          const account = await Account.getById(context, application.agentId)
          pageContext.formValues['is-contact-an-agent'] = true
          pageContext.formValues['agent-company'] = account.accountName
        }
      }
    }

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, {application: true})
      const {applicationId, applicationLineId, application} = context
      const {
        'first-name': firstName,
        'last-name': lastName,
        'is-contact-an-agent': isAgent,
        'agent-company': agentCompany,
        telephone,
        email
      } = request.payload
      let contact

      if (application.contactId) {
        contact = await Contact.getById(context, application.contactId)
        if (contact.firstName !== firstName || contact.lastName !== lastName || contact.email !== email) {
          application.contactId = undefined
        }
      }

      if (!application.contactId) {
        contact = await Contact.getByFirstnameLastnameEmail(context, firstName, lastName, email)
      }

      if (!contact) {
        contact = new Contact({firstName, lastName, email})
      }

      await contact.save(context)

      // The agent company or trading name is only set if the corresponding checkbox is ticked
      if (isAgent) {
        const account = application.agentId ? await Account.getById(context, application.agentId) : new Account()
        account.accountName = agentCompany
        await account.save(context)
        application.agentId = account.id
      } else {
        application.agentId = undefined
      }

      application.contactId = contact.id
      await application.save(context)

      const primaryContactDetails = await AddressDetail.getPrimaryContactDetails(context, applicationId)
      primaryContactDetails.telephone = telephone
      await primaryContactDetails.save(context)

      await ContactDetails.updateCompleteness(context, applicationId, applicationLineId)

      return this.redirect({request, h, redirectPath: Routes.TASK_LIST.path})
    }
  }
}
