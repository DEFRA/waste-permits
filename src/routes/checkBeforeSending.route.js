'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const CheckBeforeSendingController = require('../controllers/checkBeforeSending.controller')
const controller = new CheckBeforeSendingController({route: Constants.Routes.CHECK_BEFORE_SENDING})

module.exports = Route.register('GET, POST', controller)
