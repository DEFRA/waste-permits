'use strict'

const ContactsController = require('../controllers/contacts.controller')

module.exports = [{
  method: ['GET', 'POST'],
  path: '/search',
  config: {
    description: 'The location page',
    handler: ContactsController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
