'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const EmailSentController = require('../../controllers/saveAndReturn/emailSent.controller')
const EmailSentValidator = require('../../validators/saveAndReturn/emailSent.validator')
const validator = new EmailSentValidator()
const controller = new EmailSentController(Constants.Routes.SAVE_AND_RETURN_COMPLETE, validator)

module.exports = Route.register('GET, POST', controller, validator)
