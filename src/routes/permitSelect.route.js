'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const PermitSelectController = require('../controllers/permitSelect.controller')
const PermitSelectValidator = require('../validators/permitSelect.validator')
const validator = new PermitSelectValidator()
const controller = new PermitSelectController(Constants.Routes.PERMIT_SELECT)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, validator)
module.exports = route.register()
