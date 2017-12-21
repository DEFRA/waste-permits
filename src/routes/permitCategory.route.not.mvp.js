'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const PermitCategoryController = require('../controllers/permitCategory.controller')
const PermitCategoryValidator = require('../validators/permitCategory.validator')
const controller = new PermitCategoryController(Constants.Routes.PERMIT_CATEGORY)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, new PermitCategoryValidator())
module.exports = route.register()
