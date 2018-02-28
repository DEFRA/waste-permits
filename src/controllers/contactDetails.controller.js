'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const Contact = require('../models/contact.model')
const AddressDetail = require('../models/addressDetail.model')
const Account = require('../models/account.model')
const Application = require('../models/application.model')
const ContactDetails = require('../models/taskList/contactDetails.model')
const CookieService = require('../services/cookie.service')

module.exports = class ContactDetailsController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    const application = await Application.getById(authToken, applicationId)

    if (application.isSubmitted()) {
      return reply
        .redirect(Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
        .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
    }

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

    return reply
      .view('contactDetails', pageContext)
      .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
      const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
      const application = await Application.getById(authToken, applicationId)
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

      const applicationLineId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_LINE_ID)
      await ContactDetails.updateCompleteness(authToken, applicationId, applicationLineId)

      return reply
        .redirect(Constants.Routes.TASK_LIST.path)
        .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
    }
  }
}
