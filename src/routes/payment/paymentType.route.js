'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const PaymentTypeController = require('../../controllers/payment/paymentType.controller')
const PaymentTypeValidator = require('../../validators/paymentType.validator')
const validator = new PaymentTypeValidator()
const controller = new PaymentTypeController(Constants.Routes.PAYMENT.PAYMENT_TYPE, validator)

module.exports = Route.register('GET, POST', controller, validator)
