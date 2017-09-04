'use strict'

const Constants = require('../constants')
const RootController = require('../controllers/root.controller')

module.exports = [{
  method: ['GET', 'POST'],
  path: Constants.Routes.ROOT.path,
  config: {
    description: 'The home page',
    handler: RootController.handler
  }
}]
