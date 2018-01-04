'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const PreApplicationController = require('../controllers/preApplication.controller')
const controller = new PreApplicationController(Constants.Routes.PRE_APPLICATION)

module.exports = Route.register('GET', controller, true)
