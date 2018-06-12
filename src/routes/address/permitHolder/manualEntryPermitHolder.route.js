'use strict'

const Constants = require('../../../constants')
const Route = require('../../baseRoute')
const AddressManualInvoiceController = require('../../../controllers/address/permitHolder/addressManualPermitHolder.controller')
const AddressManualValidator = require('../../../validators/address/addressManual.validator')
const validator = new AddressManualValidator()
const controller = new AddressManualInvoiceController({route: Constants.Routes.MANUAL_PERMIT_HOLDER, validator})

module.exports = Route.register('GET, POST', controller, validator)
