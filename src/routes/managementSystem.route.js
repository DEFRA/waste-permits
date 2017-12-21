'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const ManagementSystemController = require('../controllers/managementSystem.controller')
const controller = new ManagementSystemController(Constants.Routes.MANAGEMENT_SYSTEM)

const routes = [{
  method: 'GET'
}]

const route = new BaseRoute(routes, controller)
module.exports = route.register()
