'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const TechnicalProblemController = require('../../controllers/error/technicalProblem.controller')
const controller = new TechnicalProblemController({route: Constants.Routes.ERROR.TECHNICAL_PROBLEM, cookieValidationRequired: false, applicationRequired: false})

module.exports = Route.register('GET', controller)
