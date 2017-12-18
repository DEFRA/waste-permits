'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const Contact = require('../models/contact.model')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')

module.exports = class ContactSearchController extends BaseController {
  async doGet (request, reply, errors = undefined) {
    const pageContext = this.createPageContext(errors)

    const authToken = CookieService.getAuthToken(request)

    // List the contacts
    pageContext.contacts = await Contact.list(authToken)

    return reply
      .view('contactSearch', pageContext)
  }

  async doPost (request, reply) {
    const authToken = CookieService.getAuthToken(request)

    if (request.payload.id) {
      const contact = await Contact.getById(authToken, request.payload.id)
      LoggingService.logInfo(contact, request)
    }

    return reply
      .redirect(Constants.Routes.CONTACT_SEARCH.path)
  }
}
