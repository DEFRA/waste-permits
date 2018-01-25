'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const CheckYourEmailController = require('../controllers/checkYourEmail.controller')
const CheckYourEmailValidator = require('../validators/checkYourEmail.validator')
const validator = new CheckYourEmailValidator()
const controller = new CheckYourEmailController(Constants.Routes.CHECK_YOUR_EMAIL, validator, false)

module.exports = Route.register('GET, POST', controller, validator)
