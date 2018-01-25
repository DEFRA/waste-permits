'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const PostcodeController = require('../../controllers/address/postcodeInvoice.controller')
const PostcodeValidator = require('../../validators/address/postcode.validator')
const validator = new PostcodeValidator()
const controller = new PostcodeController(Constants.Routes.ADDRESS.POSTCODE_INVOICE, validator)

module.exports = Route.register('GET, POST', controller, validator)
