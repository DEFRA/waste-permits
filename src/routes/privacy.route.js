'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const PrivacyController = require('../controllers/privacy.controller')
const controller = new PrivacyController({route: Constants.Routes.PRIVACY, cookieValidationRequired: false})

module.exports = Route.register('GET', controller)
