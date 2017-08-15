'use strict'

module.exports = [{
  method: ['GET', 'POST'],
  path: '/contact',
  config: {
    description: 'The contact page',
    handler: require('../controllers/contact.controller')
  }
}]
