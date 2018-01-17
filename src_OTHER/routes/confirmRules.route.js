'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const ConfirmRulesController = require('../controllers/confirmRules.controller')
const controller = new ConfirmRulesController(Constants.Routes.CONFIRM_RULES)

module.exports = Route.register('GET, POST', controller)
