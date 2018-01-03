'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const CheckYourEmailController = require('../controllers/checkYourEmail.controller')
const CheckYourEmailValidator = require('../validators/checkYourEmail.validator')
const validator = new CheckYourEmailValidator()
const controller = new CheckYourEmailController(Constants.Routes.CHECK_YOUR_EMAIL, false)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, validator)
module.exports = route.register()
