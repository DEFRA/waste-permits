'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const EmailCheckController = require('../../controllers/saveAndReturn/emailSentCheck.controller')
const EmailSentValidator = require('../../validators/saveAndReturn/emailSent.validator')
const validator = new EmailSentValidator()
const controller = new EmailCheckController(Constants.Routes.SAVE_AND_RETURN_SENT_CHECK, validator)

module.exports = Route.register('GET, POST', controller, validator)
