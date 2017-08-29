'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const Contact = require('../models/contact.model')

module.exports = class ContactsController extends BaseController {
  static async doGet (request, reply, errors = undefined) {
    try {
      const context = {
        pageTitle: 'Waste Permits - Contacts'
      }

      const authToken = request.state[Constants.COOKIE_KEY].authToken

      // List the contacts
      context.contacts = await Contact.list(authToken)

      return reply
        .view('contacts', context)
        .state(Constants.COOKIE_KEY, request.state[Constants.COOKIE_KEY])
    } catch (error) {
      console.error(error)
      return reply.redirect('/error')
    }
  }

  static async doPost (request, reply) {
    return reply
      .redirect('/location')
      .state(Constants.COOKIE_KEY, request.state[Constants.COOKIE_KEY])
  }

  static handler (request, reply) {
    return BaseController.handler(request, reply, ContactsController)
  }
}
