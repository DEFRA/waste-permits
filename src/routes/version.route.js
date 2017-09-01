'use strict'

const VersionController = require('../controllers/version.controller')

module.exports = [{
  method: ['GET'],
  path: '/version',
  config: {
    description: 'The version page',
    handler: VersionController.handler
  }
}]
