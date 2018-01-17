'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const CompanyCheckNameController = require('../controllers/companyCheckName.controller')
const CompanyCheckNameValidator = require('../validators/companyCheckName.validator')
const validator = new CompanyCheckNameValidator()
const controller = new CompanyCheckNameController(Constants.Routes.COMPANY_CHECK_NAME)

module.exports = Route.register('GET, POST', controller, validator)
