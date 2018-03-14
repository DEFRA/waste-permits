'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const ApplyOfflineController = require('../controllers/applyOffline.controller')
const controller = new ApplyOfflineController(Constants.Routes.APPLY_OFFLINE)

module.exports = Route.register('GET', controller)
