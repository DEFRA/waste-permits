'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const Contact = require('../models/contact.model')

module.exports = class ContactSearchController extends BaseController {
  static async doGet (request, reply, errors = undefined) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.CONTACT_SEARCH, errors, ContactSearchController)

      let authToken
      if (request.state[Constants.COOKIE_KEY]) {
        authToken = request.state[Constants.COOKIE_KEY].authToken
      }

      // List the contacts
      pageContext.contacts = await Contact.list(authToken)

      return reply
        .view('contactSearch', pageContext)
    } catch (error) {
      request.log('ERROR', error)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply) {
    let authToken
    if (request.state[Constants.COOKIE_KEY]) {
      authToken = request.state[Constants.COOKIE_KEY].authToken
    }

    if (request.payload.id) {
      try {
        const contact = await Contact.getById(authToken, request.payload.id)
        request.log('INFO', contact)
      } catch (error) {
        request.log('ERROR', error)
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }

    return reply
      .redirect(Constants.Routes.CONTACT_SEARCH.path)
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, ContactSearchController)
  }
}
