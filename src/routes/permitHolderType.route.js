'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const PermitHolderTypeController = require('../controllers/permitHolderType.controller')
const controller = new PermitHolderTypeController(Constants.Routes.PERMIT_HOLDER_TYPE)

module.exports = Route.register('GET', controller, true)
