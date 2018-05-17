'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')

const Contact = require('../models/contact.model')

module.exports = class PermitHolderContactDetailsController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const {authToken, application} = await RecoveryService.createApplicationContext(h, {application: true})

      // If we don't have a permit holder at this point something has gone wrong
      if (!application.individualPermitHolderId()) {
        throw Error("Application does not have a permit holder")
      }

      let contact = await Contact.getIndividualPermitHolderByApplicationId(authToken, application.id)
      
      if (contact) {
        pageContext.formValues = {
          'email': contact.email
          // TODO: Add telephone
        }
      }
    }

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const { authToken, application } = await RecoveryService.createApplicationContext(h, { application: true })
      const {
        'email': email
        // TODO: Add telephone
      } = request.payload
      let contact

      // If we don't have a permit holder at this point something has gone wrong
      if (!application.individualPermitHolderId()) {
        throw Error("Application does not have a permit holder")
      }

      // Get an existing contact if we have it, but use a new contact if the email address has changed
      contact = await Contact.getIndividualPermitHolderByApplicationId(authToken, application.id)
      const { firstName, lastName } = contact
      if (contact.email !== email) {
        contact = undefined
      }

      // If the previous contact did not have a matching email address try to find one that does
      if (contact === undefined) {
        contact = await Contact.getByFirstnameLastnameEmail(authToken, firstName, lastName, email)
      }

      if (!contact) {
        contact = new Contact({ firstName, lastName, email })
      }

      await contact.save(authToken)

      application.permitHolderIndividualId = contact.id

      await application.save(authToken)

      return this.redirect({ request, h, redirectPath: Constants.Routes.ADDRESS.POSTCODE_PERMIT_HOLDER.path })
    }
  }
}
