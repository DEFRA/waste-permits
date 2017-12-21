'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const ConfirmRulesController = require('../controllers/confirmRules.controller')
const controller = new ConfirmRulesController(Constants.Routes.CONFIRM_RULES)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller)
module.exports = route.register()
