'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const {COMPANY_DECLARE_OFFENCES, COMPANY_DECLARE_BANKRUPTCY} = Constants.Routes
const CompanyDeclareOffencesController = require('../controllers/declareOffences.controller')
const CompanyDeclareOffencesValidator = require('../validators/declareOffences.validator')
const controller = new CompanyDeclareOffencesController(COMPANY_DECLARE_OFFENCES, true, COMPANY_DECLARE_BANKRUPTCY, new CompanyDeclareOffencesValidator())

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, new CompanyDeclareOffencesValidator())
module.exports = route.register()
