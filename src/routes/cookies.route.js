'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const DrainageTypeDrainController = require('../controllers/drainageTypeDrain.controller')
const controller = new DrainageTypeDrainController(Constants.Routes.COOKIES)

module.exports = Route.register('GET, POST', controller)
