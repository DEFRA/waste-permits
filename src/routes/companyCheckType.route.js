'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const CompanyTypeController = require('../controllers/companyCheckType.controller')
const controller = new CompanyTypeController({route: Constants.Routes.PERMIT_HOLDER.COMPANY_CHECK_TYPE})

module.exports = Route.register('GET', controller, true)
