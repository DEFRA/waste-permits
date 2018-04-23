'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const PaymentResultController = require('../../controllers/payment/paymentResult.controller')
const controller = new PaymentResultController({route: Constants.Routes.PAYMENT.PAYMENT_RESULT, cookieValidationRequired: false, submittedRequired: true})

module.exports = Route.register('GET, POST', controller)
