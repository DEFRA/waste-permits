'use strict'

module.exports = [{
  method: ['GET', 'POST'],
  path: '/',
  handler: require('../controllers/default.controller')
}]
