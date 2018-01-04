'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const CompanyStatusController = require('../controllers/companyCheckStatus.controller')
const controller = new CompanyStatusController(Constants.Routes.COMPANY_CHECK_STATUS)

module.exports = Route.register('GET', controller, true)
