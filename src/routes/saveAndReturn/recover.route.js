'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const RecoverController = require('../../controllers/saveAndReturn/recover.controller')
const controller = new RecoverController(Constants.Routes.SAVE_AND_RETURN_RECOVER, undefined, false)

module.exports = Route.register('GET, POST', controller)
