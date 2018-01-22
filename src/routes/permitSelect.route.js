'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const PermitSelectController = require('../controllers/permitSelect.controller')
const PermitSelectValidator = require('../validators/permitSelect.validator')
const validator = new PermitSelectValidator()
const controller = new PermitSelectController(Constants.Routes.PERMIT_SELECT, validator)

module.exports = Route.register('GET, POST', controller, validator)
