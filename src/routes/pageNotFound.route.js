'use strict'

const Constants = require('../constants')
const PageNotFoundController = require('../controllers/pageNotFound.controller')
const controller = new PageNotFoundController(Constants.Routes.PAGE_NOT_FOUND)

module.exports = [{
  method: 'GET',
  path: controller.path,
  config: {
    description: 'The 404 (page not found) page',
    handler: controller.handler,
    bind: controller
  }
}]
