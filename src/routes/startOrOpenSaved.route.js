'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const StartOrOpenSavedController = require('../controllers/startOrOpenSaved.controller')
const StartOrOpenSavedValidator = require('../validators/startOrOpenSaved.validator')
const validator = new StartOrOpenSavedValidator()
const controller = new StartOrOpenSavedController(Constants.Routes.START_OR_OPEN_SAVED, false)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, validator)
module.exports = route.register()
