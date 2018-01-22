'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const ErrorController = require('../controllers/error.controller')
const controller = new ErrorController(Constants.Routes.ERROR, null, false)

module.exports = Route.register('GET', controller)
