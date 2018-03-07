'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const PaymentBacsController = require('../controllers/paymentBacs.controller')
const controller = new PaymentBacsController(Constants.Routes.BACS_PAYMENT)

module.exports = Route.register('GET, POST', controller)
