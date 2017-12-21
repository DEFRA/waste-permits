'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const CompanyNumberController = require('../controllers/companyNumber.controller')
const CompanyNumberValidator = require('../validators/companyNumber.validator')
const controller = new CompanyNumberController(Constants.Routes.COMPANY_NUMBER)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, new CompanyNumberValidator())
module.exports = route.register()
