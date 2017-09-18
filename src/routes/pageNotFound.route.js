'use strict'

const Constants = require('../constants')
const PageNotFoundController = require('../controllers/pageNotFound.controller')

module.exports = [{
  method: 'GET',
  path: Constants.Routes.PAGE_NOT_FOUND.path,
  config: {
    description: 'The 404 (page not found) page',
    handler: PageNotFoundController.handler
  }
}]
