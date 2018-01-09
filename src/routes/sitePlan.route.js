'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const SitePlanController = require('../controllers/sitePlan.controller')
const controller = new SitePlanController(Constants.Routes.SITE_PLAN)

module.exports = Route.register('GET', controller, true)
