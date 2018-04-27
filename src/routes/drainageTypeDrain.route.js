'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const DrainageTypeDrainController = require('../controllers/drainageTypeDrain.controller')
const DrainageTypeDrainValidator = require('../validators/drainageTypeDrain.validator')
const validator = new DrainageTypeDrainValidator()
const controller = new DrainageTypeDrainController({route: Constants.Routes.DRAINAGE_TYPE_DRAIN, validator})

module.exports = Route.register('GET, POST', controller, validator)
