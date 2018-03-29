'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const EmailEnterController = require('../../controllers/saveAndReturn/enterEmail.controller')
const EmailEnterValidator = require('../../validators/saveAndReturn/emailEnter.validator')
const validator = new EmailEnterValidator()
const controller = new EmailEnterController(Constants.Routes.SAVE_AND_RETURN_EMAIL, validator)

module.exports = Route.register('GET, POST', controller, validator)
