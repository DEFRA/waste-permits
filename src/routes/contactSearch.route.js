'use strict'

const ContactSearchController = require('../controllers/contactSearch.controller')

module.exports = [{
  method: ['GET', 'POST'],
  path: '/contact-search',
  config: {
    description: 'The contact search page',
    handler: ContactSearchController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
