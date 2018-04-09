'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const RecoveryFailedController = require('../../controllers/error/recoveryFailed.controller')
const controller = new RecoveryFailedController(Constants.Routes.ERROR.RECOVERY_FAILED, undefined, false)

module.exports = Route.register('GET', controller)
