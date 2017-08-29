'use strict'

module.exports = [{
  method: 'GET',
  path: '/public/{param*}',

  config: {
    description: 'The public folder',
    handler: {
      directory: {
        path: 'public/',
        listing: true
      }
    }
  }
}]
