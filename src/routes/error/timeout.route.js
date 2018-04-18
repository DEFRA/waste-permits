'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const TimeoutController = require('../../controllers/error/timeout.controller')
const controller = new TimeoutController({route: Constants.Routes.ERROR.TIMEOUT, cookieValidationRequired: false})

module.exports = Route.register('GET', controller)
