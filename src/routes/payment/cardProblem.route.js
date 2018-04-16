'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const CardProblemController = require('../../controllers/payment/cardProblem.controller')
const controller = new CardProblemController(Constants.Routes.PAYMENT.CARD_PROBLEM)

module.exports = Route.register('GET', controller)
