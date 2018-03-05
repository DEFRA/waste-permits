'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const NotSubmittedController = require('../../controllers/error/notSubmitted.controller')
const controller = new NotSubmittedController(Constants.Routes.ERROR.NOT_SUBMITTED)

module.exports = Route.register('GET', controller)
