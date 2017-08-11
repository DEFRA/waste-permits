'use strict'

module.exports = [{
  method: ['GET', 'POST'],
  path: '/',
  config: {
    description: 'The home page',
    handler: require('../controllers/default.controller')
  }
}]
