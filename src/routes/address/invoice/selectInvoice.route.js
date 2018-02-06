'use strict'

const Constants = require('../../../constants')
const Route = require('../../baseRoute')
const AddressSelectInvoiceController = require('../../../controllers/address/invoice/selectInvoice.controller')
const AddressSelectValidator = require('../../../validators/address/addressSelect.validator')
const validator = new AddressSelectValidator()
const controller = new AddressSelectInvoiceController(Constants.Routes.ADDRESS.SELECT_INVOICE, validator)

module.exports = Route.register('GET, POST', controller, validator)
