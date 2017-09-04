'use strict'

const Constants = require('../constants')
const ContactSearchController = require('../controllers/contactSearch.controller')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.CONTACTSEARCH.path,
  config: {
    description: 'The GET Contact search page',
    handler: ContactSearchController.handler
  }
}, {
  method: ['POST'],
  path: Constants.Routes.CONTACTSEARCH.path,
  config: {
    description: 'The POST Contact search page',
    handler: ContactSearchController.handler
  }
}]
