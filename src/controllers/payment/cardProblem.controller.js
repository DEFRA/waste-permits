'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const Payment = require('../../models/payment.model')

module.exports = class CardProblemController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)

    const {authToken, application, applicationLine} = await this.createApplicationContext(request, {application: true, applicationLine: true})

    let payment = await Payment.getCardPaymentDetails(authToken, applicationLine.id)

    if (!application.isSubmitted()) {
      return this.redirect(request, h, Constants.Routes.ERROR.NOT_SUBMITTED.path)
    } else if (payment && (payment.statusCode === Constants.Dynamics.PaymentStatusCodes.ISSUED || application.paymentReceived)) {
      return this.redirect(request, h, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    pageContext.urls = {
      cardPayment: Constants.Routes.PAYMENT.CARD_PAYMENT.path,
      bacsPayment: Constants.Routes.PAYMENT.BACS_PAYMENT.path
    }

    return this.showView(request, h, 'payment/cardProblem', pageContext)
  }
}
