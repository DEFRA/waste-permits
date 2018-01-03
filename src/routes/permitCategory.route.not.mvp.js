'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const PermitCategoryController = require('../controllers/permitCategory.controller')
const PermitCategoryValidator = require('../validators/permitCategory.validator')
const validator = new PermitCategoryValidator()
const controller = new PermitCategoryController(Constants.Routes.PERMIT_CATEGORY)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, validator)
module.exports = route.register()
