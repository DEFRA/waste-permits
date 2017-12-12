'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const Contact = require('../models/contact.model')
const CookieService = require('../services/cookie.service')

module.exports = class ContactDetailsController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors, new ContactDetailsController())

    return reply
      .view('contactDetails', pageContext)
  }

  async doPost (request, reply, errors) {
    const authToken = CookieService.getAuthToken(request)

    // TODO: Our first step after confirming the user session is valid and we
    // have an authToken would be to validate the post data, possibly using
    // something like Joi.
    // Because the properties of a model may be collected over a series of pages
    // we can't expect to be able to simply call `isValid()` on it (without
    // putting lots of conditionals within the method based on current state
    // and page).
    // Ideally we should aim to follow a similar model as other services, where
    // validation is related to the current form. In Ruby this is commonly
    // referred to as 'form objects'.

    if (!request.payload.id) {
      // Create new contact
      const contact = new Contact({
        firstName: request.payload['first-name'],
        lastName: request.payload['last-name'],
        telephone: request.payload.telephone,
        email: request.payload.email
      })

      await contact.save(authToken)

      return reply
        .redirect(Constants.Routes.TASK_LIST.path)
    } else {
      // Update existing Contact
      const contact = await Contact.getById(authToken, request.payload.id)

      contact.firstName = request.payload.firstName
      contact.lastName = request.payload.lastName
      contact.telephone = request.payload.telephone
      contact.email = request.payload.email

      await contact.save(authToken)

      return this.doGet(request, reply, errors)
    }
  }
}
