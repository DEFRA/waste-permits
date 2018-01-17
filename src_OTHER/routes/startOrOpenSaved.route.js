'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const StartOrOpenSavedController = require('../controllers/startOrOpenSaved.controller')
const StartOrOpenSavedValidator = require('../validators/startOrOpenSaved.validator')
const validator = new StartOrOpenSavedValidator()
const controller = new StartOrOpenSavedController(Constants.Routes.START_OR_OPEN_SAVED, false)

module.exports = Route.register('GET, POST', controller, validator)
