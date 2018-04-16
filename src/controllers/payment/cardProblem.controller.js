'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
// const Payment = require('../../models/payment.model')
// const {CARD_PAYMENT, BACS_PAYMENT} = Constants.Dynamics.PaymentTypes

module.exports = class CardProblemController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)

    pageContext.urls = {
      cardPayment: Constants.Routes.PAYMENT.CARD_PAYMENT.path,
      bacsPayment: Constants.Routes.PAYMENT.BACS_PAYMENT.path
    }

    return this.showView(request, h, 'payment/cardProblem', pageContext)
  }
}
