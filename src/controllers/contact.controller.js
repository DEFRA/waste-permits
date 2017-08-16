'use strict'

const BaseController = require('./base.controller')
const Contact = require('../models/contact.model')

module.exports = class ContactController extends BaseController {
  static async doGet (request, reply) {
    try {
      const context = {
        pageTitle: 'Waste Permits - Contact Details',
        title: 'Who should we contact about this application?',

        // List the contacts
        contacts: await Contact.list(request.state.session.crmToken)
      }
      return reply
        .view('contact', context)
        .state('session', request.state.session)
    } catch (error) {
      console.error(error)
      return reply.redirect('/error')
    }
  }

  static async doPost (request, reply) {
    if (request.payload.id) {
      // Update existing Contact
      const contact = Contact.getById(request.payload.id)
      contact.contactName = request.payload.updatedContactName

      // TODO handle errors
      // const result =
      await contact.update(request.state.session.crmToken)

      // if (result === 'success') {
      return ContactController.doGet(request, reply)
    } else {
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
        // TODO handle errors
        // const result =
        await contact.save(request.state.session.crmToken)

        // if (result === 'success') {
        return reply
          .redirect('/task-list')
          .state('session', request.state.session)
        // }
      // } else {
      //   // TODO: Handle save error
      //   return reply.redirect('/error')
      // }
      }
    }
  }

  static handler (request, reply) {
    return BaseController.handler(request, reply, ContactController)
  }
}
