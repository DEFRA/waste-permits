'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const AddressSelectInvoiceController = require('../controllers/addressSelectInvoice.controller')
const AddressSelectValidator = require('../validators/addressSelect.validator')
const validator = new AddressSelectValidator()
const controller = new AddressSelectInvoiceController(Constants.Routes.ADDRESS_SELECT_INVOICE)

module.exports = Route.register('GET, POST', controller, validator)
