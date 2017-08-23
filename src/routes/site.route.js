'use strict'

const SiteController = require('../controllers/site.controller')

module.exports = [{
  method: ['GET', 'POST'],
  path: '/site',
  config: {
    description: 'The site page',
    handler: SiteController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
