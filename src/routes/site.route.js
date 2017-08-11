'use strict'

module.exports = [{
  method: ['GET', 'POST'],
  path: '/site',
  config: {
    description: 'The site page',
    handler: require('../controllers/site.controller')
  }
}]
