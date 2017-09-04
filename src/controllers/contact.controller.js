'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const Contact = require('../models/contact.model')

module.exports = class ContactController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.CONTACT.pageHeading, errors, ContactController)

      let authToken
      if (request.state[Constants.COOKIE_KEY]) {
        authToken = request.state[Constants.COOKIE_KEY].authToken
      }

      // List the contacts
      pageContext.contacts = await Contact.list(authToken)

      return reply
        .view('contact', pageContext)
        .state(Constants.COOKIE_KEY, request.state[Constants.COOKIE_KEY])
    } catch (error) {
      console.error(error)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    let authToken
    if (request.state[Constants.COOKIE_KEY]) {
      authToken = request.state[Constants.COOKIE_KEY].authToken
    }

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
        firstname: request.payload.firstname,
        lastname: request.payload.lastname,
        telephone1: request.payload.telephone1,
        emailaddress1: request.payload.emailaddress1
      })

      try {
        await contact.save(authToken)

        return reply
          .redirect(Constants.Routes.TASK_LIST.path)
          .state(Constants.COOKIE_KEY, request.state[Constants.COOKIE_KEY])
      } catch (error) {
        console.error(error)
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    } else {
      // Update existing Contact
      const contact = Contact.getById(request.payload.id)
      contact.contactName = request.payload.updatedContactName

      try {
        await contact.save(authToken)

        return ContactController.doGet(request, reply, errors)
      } catch (error) {
        console.error(error)
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, ContactController)
  }
}
