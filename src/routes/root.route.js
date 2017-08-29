'use strict'

const RootController = require('../controllers/root.controller')

module.exports = [{
  method: ['GET', 'POST'],
  path: '/',
  config: {
    description: 'The home page',
    handler: RootController.handler
  }
}]
