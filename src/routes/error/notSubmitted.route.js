'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const NotSubmittedController = require('../../controllers/error/notSubmitted.controller')
const controller = new NotSubmittedController({route: Constants.Routes.NOT_SUBMITTED, cookieValidationRequired: false})

module.exports = Route.register('GET', controller)
