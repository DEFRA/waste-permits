'use strict'

const Constants = require('../../../constants')
const Route = require('../../baseRoute')
const {COMPANY_DECLARE_OFFENCES, COMPANY_DECLARE_BANKRUPTCY} = Constants.Routes
const CompanyOffencesController = require('../../../controllers/declaration/company/offences.controller')
const CompanyOffencesValidator = require('../../../validators/declaration/company/offences.validator')
const validator = new CompanyOffencesValidator()
const controller = new CompanyOffencesController(COMPANY_DECLARE_OFFENCES, validator, true, COMPANY_DECLARE_BANKRUPTCY)

module.exports = Route.register('GET, POST', controller, validator)
