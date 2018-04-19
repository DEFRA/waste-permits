'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const RecoveryFailedController = require('../../controllers/error/recoveryFailed.controller')
const controller = new RecoveryFailedController({route: Constants.Routes.ERROR.RECOVERY_FAILED, cookieValidationRequired: false})

module.exports = Route.register('GET', controller)
