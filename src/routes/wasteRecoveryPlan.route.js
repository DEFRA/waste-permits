'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const WasteRecoveryPlanController = require('../controllers/wasteRecoveryPlan.controller')
const controller = new WasteRecoveryPlanController(Constants.Routes.WASTE_RECOVERY_PLAN)

const routes = [{
  method: 'GET'
}]

const route = new BaseRoute(routes, controller)
module.exports = route.register()
