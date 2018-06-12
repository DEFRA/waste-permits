'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const CookiesDisabledController = require('../../controllers/error/cookiesDisabled.controller')
const controller = new CookiesDisabledController({route: Constants.Routes.COOKIES_DISABLED, cookieValidationRequired: false, applicationRequired: false})

module.exports = Route.register('GET', controller)
