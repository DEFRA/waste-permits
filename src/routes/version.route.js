'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const VersionController = require('../controllers/version.controller')
const controller = new VersionController({route: Constants.Routes.VERSION, cookieValidationRequired: false})

module.exports = Route.register('GET', controller)
