'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const {COMPANY_DECLARE_OFFENCES, COMPANY_DECLARE_BANKRUPTCY} = Constants.Routes
const CompanyDeclareOffencesController = require('../controllers/declareOffences.controller')
const CompanyDeclareOffencesValidator = require('../validators/declareOffences.validator')
const validator = new CompanyDeclareOffencesValidator()
const controller = new CompanyDeclareOffencesController(COMPANY_DECLARE_OFFENCES, true, COMPANY_DECLARE_BANKRUPTCY, validator)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, validator)
module.exports = route.register()
