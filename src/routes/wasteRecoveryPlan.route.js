'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const WasteRecoveryPlanController = require('../controllers/wasteRecoveryPlan.controller')
const controller = new WasteRecoveryPlanController({route: Constants.Routes.WASTE_RECOVERY_PLAN})

module.exports = Route.register('GET, POST', controller)
