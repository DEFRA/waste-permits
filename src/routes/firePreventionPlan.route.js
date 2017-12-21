'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const FirePreventionPlanController = require('../controllers/firePreventionPlan.controller')
const controller = new FirePreventionPlanController(Constants.Routes.FIRE_PREVENTION_PLAN)

const routes = [{
  method: 'GET'
}]

const route = new BaseRoute(routes, controller)
module.exports = route.register()
