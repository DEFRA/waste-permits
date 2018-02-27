'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const RootController = require('../controllers/root.controller')
const controller = new RootController(Constants.Routes.ROOT, undefined, false)

module.exports = Route.register('GET', controller)
