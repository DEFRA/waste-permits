'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const Contact = require('../models/contact.model')

module.exports = class ContactSearchController extends BaseController {
  static async doGet (request, reply, errors = undefined) {
    try {
      const context = {
        pageTitle: 'Contact search - Waste Permits - GOV.UK'
      }

      let authToken
      if (request.state[Constants.COOKIE_KEY]) {
        authToken = request.state[Constants.COOKIE_KEY].authToken
      }

      // List the contacts
      context.contacts = await Contact.list(authToken)

      return reply
        .view('contactSearch', context)
        .state(Constants.COOKIE_KEY, request.state[Constants.COOKIE_KEY])
    } catch (error) {
      console.error(error)
      return reply.redirect('/error')
    }
  }

  static async doPost (request, reply) {
    let authToken
    if (request.state[Constants.COOKIE_KEY]) {
      authToken = request.state[Constants.COOKIE_KEY].authToken
    }

    if (request.payload.id) {
      const contact = await Contact.getById(authToken, request.payload.id)

      console.log(contact)
    }

    return reply
      .redirect('/contact-search')
      .state(Constants.COOKIE_KEY, request.state[Constants.COOKIE_KEY])
  }

  static handler (request, reply) {
    return BaseController.handler(request, reply, ContactSearchController)
  }
}
