'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const PaymentBacsController = require('../../controllers/payment/paymentBacs.controller')
const controller = new PaymentBacsController({route: Constants.Routes.PAYMENT.BACS_PAYMENT, submittedRequired: true})

module.exports = Route.register('GET, POST', controller)
