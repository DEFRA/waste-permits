'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const ManagementSystemController = require('../controllers/managementSystem.controller')
const controller = new ManagementSystemController(Constants.Routes.MANAGEMENT_SYSTEM)

module.exports = Route.register('GET, POST', controller)
