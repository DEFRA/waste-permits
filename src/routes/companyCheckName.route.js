'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const CompanyCheckNameController = require('../controllers/companyCheckName.controller')
const CompanyCheckNameValidator = require('../validators/companyCheckName.validator')
const validator = new CompanyCheckNameValidator()
const controller = new CompanyCheckNameController(Constants.Routes.COMPANY_CHECK_NAME)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, validator)
module.exports = route.register()
