'use strict'

const Constants = require('../constants')
const SitePlanController = require('../controllers/sitePlan.controller')
const controller = new SitePlanController(Constants.Routes.SITE_PLAN)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The Upload the site plan page',
    handler: controller.handler,
    bind: controller,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
