'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const CompanyStatusController = require('../controllers/companyCheckStatus.controller')
const controller = new CompanyStatusController(Constants.Routes.COMPANY_CHECK_STATUS)

const routes = [{
  method: 'GET'
}]

const route = new BaseRoute(routes, controller)
module.exports = route.register()
