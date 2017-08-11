'use strict'

module.exports = [{
  method: 'GET',
  path: '/error',
  config: {
    description: 'The error page',
    handler: require('../controllers/site.controller')
  }
}]
