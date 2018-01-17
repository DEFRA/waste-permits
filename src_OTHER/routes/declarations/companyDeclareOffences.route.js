'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const {COMPANY_DECLARE_OFFENCES, COMPANY_DECLARE_BANKRUPTCY} = Constants.Routes
const CompanyDeclareOffencesController = require('../../controllers/declarations/declareOffences.controller')
const CompanyDeclareOffencesValidator = require('../../validators/declareOffences.validator')
const validator = new CompanyDeclareOffencesValidator()
const controller = new CompanyDeclareOffencesController(COMPANY_DECLARE_OFFENCES, true, COMPANY_DECLARE_BANKRUPTCY, validator)

module.exports = Route.register('GET, POST', controller, validator)
