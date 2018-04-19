'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const ApplicationReceivedController = require('../controllers/applicationReceived.controller')
const controller = new ApplicationReceivedController({route: Constants.Routes.APPLICATION_RECEIVED})

module.exports = Route.register('GET', controller)
