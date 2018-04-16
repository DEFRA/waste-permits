'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const Payment = require('../../models/payment.model')

module.exports = class PaymentResultController extends BaseController {
  async doGet (request, h, errors) {
    const {authToken, application, applicationLine} = await this.createApplicationContext(request, {application: true, applicationLine: true})
    const payment = await Payment.getCardPaymentDetails(authToken, applicationLine.id)

    // if (!application.isSubmitted()) {
    //   return this.redirect(request, h, Constants.Routes.ERROR.NOT_SUBMITTED.path)
    // } else if (payment && (payment.statusCode === Constants.Dynamics.PaymentStatusCodes.ISSUED || application.paymentReceived)) {
    //   return this.redirect(request, h, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    // }

    const paymentStatus = await payment.getCardPaymentResult(authToken)

    // Look at the result of the payment and redirect off to the appropriate result screen
    if (paymentStatus === 'success') {
      application.paymentReceived = true
      await application.save(authToken)

      return this.redirect(request, h, Constants.Routes.APPLICATION_RECEIVED.path)
    } else {
      return this.redirect(request, h, Constants.Routes.PAYMENT.CARD_PROBLEM.path)
    }
  }
}
