'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const StartAtBeginningController = require('../../controllers/error/startAtBeginning.controller')
const controller = new StartAtBeginningController({route: Constants.Routes.ERROR.START_AT_BEGINNING, cookieValidationRequired: false})

module.exports = Route.register('GET', controller)
