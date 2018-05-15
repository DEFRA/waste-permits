'use strict'

const Constants = require('../../../constants')
const Route = require('../../baseRoute')
const AddressSelectInvoiceController = require('../../../controllers/address/permitHolder/selectPermitHolder.controller')
const AddressSelectValidator = require('../../../validators/address/addressSelect.validator')
const validator = new AddressSelectValidator()
const controller = new AddressSelectInvoiceController({route: Constants.Routes.ADDRESS.SELECT_PERMIT_HOLDER, validator})

module.exports = Route.register('GET, POST', controller, validator)
