'use strict'

const Contact = require('../models/contact.model')

module.exports = function (request, reply) {
  const context = {
    pageTitle: 'Waste Permits - Contact Details',
    message: 'Hello, World!'
  }

  // Validate the session cookie
  let token = request.server.methods.validateToken(request.state.session)
  if (!token) {
    // Redirect off an error screen
    return reply.redirect('/error')
  }

  const doGet = async (request, reply) => {
    // List the contacts
    const contacts = await Contact.list(request.state.session.crmToken)

    context.contacts = contacts

    return reply
      .view('contact', context)
      .state('session', request.state.session)
  }

  const doPost = async (request, reply) => {
    const contact = new Contact({
      contactName: request.payload.contactName,
      contactTelephone: request.payload.contactTelephone,
      contactEmail: request.payload.contactEmail
    })
    context.contact = contact

    if (!contact.isValid) {
      // TODO: Validate post data using Joi?
      // TODO: Handle validation error
      // context.errors = {
      //   message: 'Invalid site name: [' + request.payload.siteName + ']'
      // }
      console.log('Invalid contact:' + contact.toString())
      doGet(request, reply)
    } else {
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

  if (request.method === 'get') {
    doGet(request, reply)
  } else if (request.method === 'post') {
    doPost(request, reply)
  }
}
