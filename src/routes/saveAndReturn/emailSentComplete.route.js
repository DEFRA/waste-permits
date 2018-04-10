'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const EmailSentController = require('../../controllers/saveAndReturn/emailSent.controller')
const SaveAndReturnValidator = require('../../validators/saveAndReturn.validator')
const validator = new SaveAndReturnValidator()
const controller = new EmailSentController(Constants.Routes.SAVE_AND_RETURN_COMPLETE, validator)

module.exports = Route.register('GET, POST', controller, validator)
