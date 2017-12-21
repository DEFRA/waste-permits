'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const PreApplicationController = require('../controllers/preApplication.controller')
const controller = new PreApplicationController(Constants.Routes.PRE_APPLICATION)

const routes = [{
  method: 'GET'
}]

const route = new BaseRoute(routes, controller)
module.exports = route.register()
