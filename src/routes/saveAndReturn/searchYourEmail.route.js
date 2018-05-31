'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const CheckYourEmailController = require('../../controllers/saveAndReturn/checkYourEmail.controller')
const SaveAndReturnValidator = require('../../validators/saveAndReturn.validator')
const validator = new SaveAndReturnValidator()
const controller = new CheckYourEmailController({route: Constants.Routes.SEARCH_YOUR_EMAIL, validator, cookieValidationRequired: false, applicationRequired: false})

module.exports = Route.register('GET, POST', controller, validator)
