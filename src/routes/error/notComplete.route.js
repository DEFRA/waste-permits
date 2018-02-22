'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const NotCompleteController = require('../../controllers/error/notComplete.controller')
const controller = new NotCompleteController(Constants.Routes.ERROR.NOT_COMPLETE, undefined, true)

module.exports = Route.register('GET', controller)
