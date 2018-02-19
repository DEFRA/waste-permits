'use strict'

const Constants = require('../../../constants')
const Route = require('../../baseRoute')
const {COMPANY_DECLARE_BANKRUPTCY, TASK_LIST} = Constants.Routes
const CompanyBankruptcyController = require('../../../controllers/declaration/company/bankruptcy.controller')
const CompanyBankruptcyValidator = require('../../../validators/declaration/company/bankruptcy.validator')
const validator = new CompanyBankruptcyValidator()
const controller = new CompanyBankruptcyController(COMPANY_DECLARE_BANKRUPTCY, validator, true, TASK_LIST)

module.exports = Route.register('GET, POST', controller, validator)
