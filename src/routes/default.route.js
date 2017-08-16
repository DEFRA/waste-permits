'use strict'

const DefaultController = require('../controllers/default.controller')

module.exports = [{
  method: ['GET', 'POST'],
  path: '/',
  config: {
    description: 'The home page',
    handler: DefaultController.handler
  }
}]
