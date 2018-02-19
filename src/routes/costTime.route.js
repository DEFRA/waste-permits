'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const CostTimeController = require('../controllers/costTime.controller')
const controller = new CostTimeController(Constants.Routes.COST_TIME)

module.exports = Route.register('GET, POST', controller)
