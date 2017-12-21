'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const CostTimeController = require('../controllers/costTime.controller')
const controller = new CostTimeController(Constants.Routes.COST_TIME)

const routes = [{
  method: 'GET'
}]

const route = new BaseRoute(routes, controller)
module.exports = route.register()
