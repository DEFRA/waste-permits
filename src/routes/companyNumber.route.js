'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const CompanyNumberController = require('../controllers/companyNumber.controller')
const CompanyNumberValidator = require('../validators/companyNumber.validator')
const validator = new CompanyNumberValidator()
const controller = new CompanyNumberController({route: Constants.Routes.PERMIT_HOLDER.COMPANY_NUMBER, validator})

module.exports = Route.register('GET, POST', controller, validator)
