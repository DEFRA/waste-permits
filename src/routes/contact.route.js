'use strict'

const ContactController = require('../controllers/contact.controller')

module.exports = [{
  method: ['GET', 'POST'],
  path: '/contact',
  config: {
    description: 'The contact page',
    handler: ContactController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
