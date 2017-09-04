'use strict'

const VersionController = require('../controllers/version.controller')

module.exports = [{
  method: ['GET'],
  // TODO: This path will be in the Constants once a PR has been approved and merged to master
  path: '/version',
  config: {
    description: 'The version page',
    handler: VersionController.handler
  }
}]
