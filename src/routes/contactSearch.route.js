'use strict'

const Constants = require('../constants')
const ContactSearchController = require('../controllers/contactSearch.controller')
const controller = new ContactSearchController(Constants.Routes.CONTACT_SEARCH)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The GET Contact search page',
    handler: controller.handler,
    bind: controller
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: 'The POST Contact search page',
    handler: controller.handler,
    bind: controller
  }
}]
