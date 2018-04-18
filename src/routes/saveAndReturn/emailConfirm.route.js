'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const EmailConfirmController = require('../../controllers/saveAndReturn/emailConfirm.controller')
const SaveAndReturnValidator = require('../../validators/saveAndReturn.validator')
const validator = new SaveAndReturnValidator()
const controller = new EmailConfirmController({route: Constants.Routes.SAVE_AND_RETURN_CONFIRM, validator})

module.exports = Route.register('GET, POST', controller, validator)
