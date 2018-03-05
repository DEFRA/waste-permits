'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const CookiesController = require('../controllers/cookies.controller')
const controller = new CookiesController(Constants.Routes.COOKIES, undefined, false)

module.exports = Route.register('GET', controller)
