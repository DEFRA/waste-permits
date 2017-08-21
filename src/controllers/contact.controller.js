'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const Contact = require('../models/contact.model')

module.exports = class ContactController extends BaseController {
  static async doGet (request, reply) {
    try {
      const context = {
        pageTitle: 'Waste Permits - Contact Details'
      }

      let crmToken
      if (request.state[Constants.COOKIE_KEY]) {
        crmToken = request.state[Constants.COOKIE_KEY].crmToken
      }

      // List the contacts
      context.contacts = await Contact.list(crmToken)

      return reply
        .view('contact', context)
        .state(Constants.COOKIE_KEY, request.state[Constants.COOKIE_KEY])
    } catch (error) {
      console.error(error)
      return reply.redirect('/error')
    }
  }

  static async doPost (request, reply) {
    let crmToken
    if (request.state[Constants.COOKIE_KEY]) {
      crmToken = request.state[Constants.COOKIE_KEY].crmToken
    }

    if (!request.payload.id) {
      // Create new contact
      const contact = new Contact({
        contactName: request.payload.contactName,
        contactTelephone: request.payload.contactTelephone,
        contactEmail: request.payload.contactEmail
      })

      if (!contact.isValid) {
        // TODO: Validate post data using Joi?
        // TODO: Handle validation error
        // context.errors = {
        //   message: 'Invalid site name: [' + request.payload.siteName + ']'
        // }
        console.log('Invalid contact:' + contact.toString())
        return ContactController.doGet(request, reply)
      } else {
        try {
          await contact.save(crmToken)

          return reply
            .redirect('/task-list')
            .state(Constants.COOKIE_KEY, request.state[Constants.COOKIE_KEY])
        } catch (error) {
          console.error(error)
          return reply.redirect('/error')
        }
      }
    } else {
      // Update existing Contact
      const contact = Contact.getById(request.payload.id)
      contact.contactName = request.payload.updatedContactName

      try {
        await contact.save(crmToken)

        return ContactController.doGet(request, reply)
      } catch (error) {
        console.error(error)
        return reply.redirect('/error')
      }
    }
  }

  static handler (request, reply) {
    return BaseController.handler(request, reply, ContactController)
  }
}
