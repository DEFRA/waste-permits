'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const DrainageTypeDrainController = require('../controllers/drainageTypeDrain.controller')
const controller = new DrainageTypeDrainController({route: Constants.Routes.DRAINAGE_TYPE_DRAIN})

module.exports = Route.register('GET, POST', controller)
