'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const Contact = require('../models/contact.model')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')

module.exports = class ContactSearchController extends BaseController {
  async doGet (request, reply, errors = undefined) {
    try {
      const pageContext = this.createPageContext(errors, ContactSearchController)

      const authToken = CookieService.getAuthToken(request)

      // List the contacts
      pageContext.contacts = await Contact.list(authToken)

      return reply
        .view('contactSearch', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  async doPost (request, reply) {
    const authToken = CookieService.getAuthToken(request)

    if (request.payload.id) {
      try {
        const contact = await Contact.getById(authToken, request.payload.id)
        LoggingService.logInfo(contact, request)
      } catch (error) {
        LoggingService.logError(error, request)
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }

    return reply
      .redirect(Constants.Routes.CONTACT_SEARCH.path)
  }
}
