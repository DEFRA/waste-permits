'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const PermitHolderTypeController = require('../../controllers/permitHolder/permitHolderType.controller')
const PermitHolderTypeValidator = require('../../validators/permitHolderType.validator')
const validator = new PermitHolderTypeValidator()
const controller = new PermitHolderTypeController({route: Constants.Routes.PERMIT_HOLDER_TYPE, validator})

module.exports = Route.register('GET, POST', controller, validator)
