'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const VersionController = require('../controllers/version.controller')
const controller = new VersionController(Constants.Routes.VERSION, null, false)

module.exports = Route.register('GET', controller)
