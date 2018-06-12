'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const RecoveryFailedController = require('../../controllers/error/recoveryFailed.controller')
const controller = new RecoveryFailedController({route: Constants.Routes.RECOVERY_FAILED, cookieValidationRequired: false, applicationRequired: false})

module.exports = Route.register('GET', controller)
