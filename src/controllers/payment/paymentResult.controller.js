'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const Payment = require('../../models/payment.model')

module.exports = class PaymentResultController extends BaseController {
  async doGet (request, h, errors) {
    const {authToken, application, applicationLineId} = await this.createApplicationContext(request, {application: true})
    const payment = await Payment.getCardPaymentDetails(authToken, applicationLineId)

    if (!application.isSubmitted()) {
      return this.redirect({request, h, redirectPath: Constants.Routes.ERROR.NOT_SUBMITTED.path})
    }

    const paymentStatus = await payment.getCardPaymentResult(authToken)

    // Look at the result of the payment and redirect off to the appropriate result screen
    if (paymentStatus === 'success') {
      application.paymentReceived = true
      await application.save(authToken)

      return this.redirect({request, h, redirectPath: Constants.Routes.APPLICATION_RECEIVED.path})
    } else {
      return this.redirect({request, h, redirectPath: Constants.Routes.PAYMENT.CARD_PROBLEM.path})
    }
  }
}
