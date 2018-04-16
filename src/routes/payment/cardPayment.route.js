'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const CardPaymentController = require('../../controllers/payment/cardPayment.controller')
const controller = new CardPaymentController(Constants.Routes.PAYMENT.CARD_PAYMENT)

module.exports = Route.register('GET', controller)
