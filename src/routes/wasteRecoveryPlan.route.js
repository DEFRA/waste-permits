'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const WasteRecoveryPlanController = require('../controllers/wasteRecoveryPlan.controller')
const controller = new WasteRecoveryPlanController(Constants.Routes.WASTE_RECOVERY_PLAN)

module.exports = Route.register('GET', controller, true)
