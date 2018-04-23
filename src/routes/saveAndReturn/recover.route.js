'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const RecoverController = require('../../controllers/saveAndReturn/recover.controller')
const controller = new RecoverController({route: Constants.Routes.SAVE_AND_RETURN_RECOVER, cookieValidationRequired: false, paymentRequired: false})

module.exports = Route.register('GET, POST', controller)
