'use strict'

const Constants = require('../../../constants')
const Route = require('../../baseRoute')
const AddressManualInvoiceController = require('../../../controllers/address/invoice/addressManualInvoice.controller')
const AddressManualValidator = require('../../../validators/address/addressManual.validator')
const validator = new AddressManualValidator()
const controller = new AddressManualInvoiceController(Constants.Routes.ADDRESS.MANUAL_INVOICE)

module.exports = Route.register('GET, POST', controller, validator)
