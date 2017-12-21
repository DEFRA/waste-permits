'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const PermitHolderTypeController = require('../controllers/permitHolderType.controller')
const controller = new PermitHolderTypeController(Constants.Routes.PERMIT_HOLDER_TYPE)

const routes = [{
  method: 'GET'
}]

const route = new BaseRoute(routes, controller)
module.exports = route.register()
