'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const FirePreventionPlanController = require('../controllers/firePreventionPlan.controller')
const controller = new FirePreventionPlanController(Constants.Routes.FIRE_PREVENTION_PLAN)

module.exports = Route.register('GET, POST', controller)
