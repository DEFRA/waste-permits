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
    },
    // Tag so we can suppress public assets in the log
    tags: ['public']
  }
}]
