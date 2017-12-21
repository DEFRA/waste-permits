'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const DrainageTypeDrainController = require('../controllers/drainageTypeDrain.controller')
const controller = new DrainageTypeDrainController(Constants.Routes.DRAINAGE_TYPE_DRAIN)

const routes = [{
  method: 'GET'
}]

const route = new BaseRoute(routes, controller)
module.exports = route.register()
