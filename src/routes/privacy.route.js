'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const PrivacyController = require('../controllers/privacy.controller')
const controller = new PrivacyController(Constants.Routes.PRIVACY)

module.exports = Route.register('GET, POST', controller)
