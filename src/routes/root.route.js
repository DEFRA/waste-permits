'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const RootController = require('../controllers/root.controller')
const controller = new RootController({route: Constants.Routes.ROOT, cookieValidationRequired: false})

module.exports = Route.register('GET', controller)
