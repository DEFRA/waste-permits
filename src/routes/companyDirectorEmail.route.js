'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const CompanyDirectorEmailController = require('../controllers/companyDirectorEmail.controller')
const CompanyDirectorEmailValidator = require('../validators/companyDirectorEmail.validator')

const validator = new CompanyDirectorEmailValidator()

const controller = new CompanyDirectorEmailController({route: Constants.Routes.COMPANY_DIRECTOR_EMAIL, validator})

module.exports = Route.register('GET, POST', controller, validator)
