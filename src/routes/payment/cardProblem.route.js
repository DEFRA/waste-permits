'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const CardProblemController = require('../../controllers/payment/paymentType.controller')
const PaymentTypeValidator = require('../../validators/paymentType.validator')
const validator = new PaymentTypeValidator()
const controller = new CardProblemController({route: Constants.Routes.PAYMENT.CARD_PROBLEM, validator, cookieValidationRequired: false, submittedRequired: true})

module.exports = Route.register('GET, POST', controller, validator)
