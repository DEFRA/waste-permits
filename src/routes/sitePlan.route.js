'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const SitePlanController = require('../controllers/sitePlan.controller')
const controller = new SitePlanController(Constants.Routes.SITE_PLAN)

const routes = [{
  method: 'GET'
}]

const route = new BaseRoute(routes, controller)
module.exports = route.register()
