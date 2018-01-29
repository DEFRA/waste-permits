'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const ApplicationSentController = require('../controllers/applicationSent.controller')
const controller = new ApplicationSentController(Constants.Routes.APPLICATION_SENT)

module.exports = Route.register('GET', controller)
