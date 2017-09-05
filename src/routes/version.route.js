'use strict'

const Constants = require('../constants')
const VersionController = require('../controllers/version.controller')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.VERSION.path,
  config: {
    description: 'The version page',
    handler: VersionController.handler
  }
}]
