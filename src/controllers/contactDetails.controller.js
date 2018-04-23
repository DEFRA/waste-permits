'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const Contact = require('../models/contact.model')
const AddressDetail = require('../models/addressDetail.model')
const Account = require('../models/account.model')
const ContactDetails = require('../models/taskList/contactDetails.model')
const RecoveryService = require('../services/recovery.service')

module.exports = class ContactDetailsController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken, applicationId, application} = await RecoveryService.createApplicationContext(h, {application: true})

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const contact = application.contactId ? await Contact.getById(authToken, application.contactId) : new Contact()
      const companySecretaryDetails = await AddressDetail.getCompanySecretaryDetails(authToken, applicationId)
      const primaryContactDetails = await AddressDetail.getPrimaryContactDetails(authToken, applicationId)
      if (contact) {
        pageContext.formValues = {
          'first-name': contact.firstName,
          'last-name': contact.lastName,
          'telephone': primaryContactDetails.telephone,
          'email': contact.email,
          'company-secretary-email': companySecretaryDetails.email
        }
        if (application.agentId) {
          const account = await Account.getById(authToken, application.agentId)
          pageContext.formValues['is-contact-an-agent'] = true
          pageContext.formValues['agent-company'] = account.accountName
        }
      }
    }

    return this.showView({request, h, viewPath: 'contactDetails', pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const {authToken, applicationId, applicationLineId, application} = await RecoveryService.createApplicationContext(h, {application: true})
      const {
        'first-name': firstName,
        'last-name': lastName,
        'is-contact-an-agent': isAgent,
        'agent-company': agentCompany,
        'company-secretary-email': companySecretaryEmail,
        telephone,
        email
      } = request.payload
      let contact

      if (application.contactId) {
        contact = await Contact.getById(authToken, application.contactId)
        if (contact.firstName !== firstName || contact.lastName !== lastName || contact.email !== email) {
          application.contactId = undefined
        }
      }

      if (!application.contactId) {
        contact = await Contact.getByFirstnameLastnameEmail(authToken, firstName, lastName, email)
      }

      if (!contact) {
        contact = new Contact({firstName, lastName, email})
      }

      await contact.save(authToken)

      // The agent company or trading name is only set if the corresponding checkbox is ticked
      if (isAgent) {
        const account = application.agentId ? await Account.getById(authToken, application.agentId) : new Account()
        account.accountName = agentCompany
        await account.save(authToken)
        application.agentId = account.id
      } else {
        application.agentId = undefined
      }

      application.contactId = contact.id
      await application.save(authToken)

      const companySecretaryDetails = await AddressDetail.getCompanySecretaryDetails(authToken, applicationId)
      companySecretaryDetails.email = companySecretaryEmail
      await companySecretaryDetails.save(authToken)

      const primaryContactDetails = await AddressDetail.getPrimaryContactDetails(authToken, applicationId)
      primaryContactDetails.telephone = telephone
      await primaryContactDetails.save(authToken)

      await ContactDetails.updateCompleteness(authToken, applicationId, applicationLineId)

      return this.redirect({request, h, redirectPath: Constants.Routes.TASK_LIST.path})
    }
  }
}
