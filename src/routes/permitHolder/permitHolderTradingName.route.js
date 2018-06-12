'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const PermitHolderTradingNameController = require('../../controllers/permitHolder/permitHolderTradingName.controller')
const PermitHolderTradingNameValidator = require('../../validators/permitHolder/permitHolderTradingName.validator')
const validator = new PermitHolderTradingNameValidator()
const controller = new PermitHolderTradingNameController({route: Constants.Routes.PERMIT_HOLDER.INDIVIDUAL_TRADING_NAME, validator})

module.exports = Route.register('GET, POST', controller, validator)
