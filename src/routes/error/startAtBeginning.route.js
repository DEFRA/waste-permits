'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const StartAtBeginningController = require('../../controllers/error/startAtBeginning.controller')
const controller = new StartAtBeginningController(Constants.Routes.ERROR.START_AT_BEGINNING, undefined, true)

module.exports = Route.register('GET', controller)
