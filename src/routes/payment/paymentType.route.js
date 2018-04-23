'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const PaymentTypeController = require('../../controllers/payment/paymentType.controller')
const PaymentTypeValidator = require('../../validators/paymentType.validator')
const validator = new PaymentTypeValidator()
const controller = new PaymentTypeController({route: Constants.Routes.PAYMENT.PAYMENT_TYPE, validator, submittedRequired: true, viewPath: 'payment/paymentType'})

module.exports = Route.register('GET, POST', controller, validator)
