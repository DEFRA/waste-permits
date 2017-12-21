'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const CheckBeforeSendingController = require('../controllers/checkBeforeSending.controller')
const controller = new CheckBeforeSendingController(Constants.Routes.CHECK_BEFORE_SENDING)

const routes = [{
  method: 'GET'
}]

const route = new BaseRoute(routes, controller)
module.exports = route.register()
