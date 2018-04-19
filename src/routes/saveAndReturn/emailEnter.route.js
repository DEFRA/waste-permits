'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const EmailEnterController = require('../../controllers/saveAndReturn/enterEmail.controller')
const SaveAndReturnValidator = require('../../validators/saveAndReturn.validator')
const validator = new SaveAndReturnValidator()
const controller = new EmailEnterController({route: Constants.Routes.SAVE_AND_RETURN_EMAIL, validator})

module.exports = Route.register('GET, POST', controller, validator)
