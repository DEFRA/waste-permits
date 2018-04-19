'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const AlreadySubmittedController = require('../../controllers/error/alreadySubmitted.controller')
const controller = new AlreadySubmittedController({route: Constants.Routes.ERROR.ALREADY_SUBMITTED})

module.exports = Route.register('GET', controller)
