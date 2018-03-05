'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const CookiesDisabledController = require('../../controllers/error/cookiesDisabled.controller')
const controller = new CookiesDisabledController(Constants.Routes.ERROR.COOKIES_DISABLED, undefined, false)

module.exports = Route.register('GET', controller)
