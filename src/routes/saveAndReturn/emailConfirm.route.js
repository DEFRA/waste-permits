'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const EmailConfirmController = require('../../controllers/saveAndReturn/emailConfirm.controller')
const EmailEnterValidator = require('../../validators/saveAndReturn/emailEnter.validator')
const validator = new EmailEnterValidator()
const controller = new EmailConfirmController(Constants.Routes.SAVE_AND_RETURN_CONFIRM, validator)

module.exports = Route.register('GET, POST', controller, validator)
