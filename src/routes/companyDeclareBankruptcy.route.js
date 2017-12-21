'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const {COMPANY_DECLARE_BANKRUPTCY, TASK_LIST} = Constants.Routes
const CompanyDeclareBankruptcyController = require('../controllers/declareBankruptcy.controller')
const CompanyDeclareBankruptcyValidator = require('../validators/declareBankruptcy.validator')
const controller = new CompanyDeclareBankruptcyController(COMPANY_DECLARE_BANKRUPTCY, true, TASK_LIST, new CompanyDeclareBankruptcyValidator())

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, new CompanyDeclareBankruptcyValidator())
module.exports = route.register()
