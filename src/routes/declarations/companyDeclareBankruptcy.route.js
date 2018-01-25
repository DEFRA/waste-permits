'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const {COMPANY_DECLARE_BANKRUPTCY, TASK_LIST} = Constants.Routes
const CompanyDeclareBankruptcyController = require('../../controllers/declarations/declareBankruptcy.controller')
const CompanyDeclareBankruptcyValidator = require('../../validators/declareBankruptcy.validator')
const validator = new CompanyDeclareBankruptcyValidator()
const controller = new CompanyDeclareBankruptcyController(COMPANY_DECLARE_BANKRUPTCY, validator, true, TASK_LIST)

module.exports = Route.register('GET, POST', controller, validator)
