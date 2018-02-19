'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const TimeoutController = require('../../controllers/error/timeout.controller')
const controller = new TimeoutController(Constants.Routes.TIMEOUT, undefined, false)

module.exports = Route.register('GET', controller)
