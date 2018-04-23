'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const CookiesController = require('../controllers/cookies.controller')
const controller = new CookiesController({route: Constants.Routes.COOKIES, cookieValidationRequired: false, applicationRequired: false})

module.exports = Route.register('GET', controller)
