'use strict'

const Constants = require('../constants')
const SitePlanController = require('../controllers/sitePlan.controller')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.SITE_PLAN.path,
  config: {
    description: 'The Upload the site plan page',
    handler: SitePlanController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
