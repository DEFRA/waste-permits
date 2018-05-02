'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const DrainageTypeFailController = require('../controllers/drainageTypeFail.controller')
const controller = new DrainageTypeFailController({route: Constants.Routes.DRAINAGE_TYPE_FAIL})

module.exports = Route.register('GET', controller)
