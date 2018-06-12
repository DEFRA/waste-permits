'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const CompanyCheckNameController = require('../controllers/companyCheckName.controller')
const CompanyCheckNameValidator = require('../validators/companyCheckName.validator')
const validator = new CompanyCheckNameValidator()
const controller = new CompanyCheckNameController({route: Constants.Routes.PERMIT_HOLDER.COMPANY_CHECK_NAME, validator})

module.exports = Route.register('GET, POST', controller, validator)
