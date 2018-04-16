'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const Payment = require('../../models/payment.model')

module.exports = class PaymentResultController extends BaseController {
  async doGet (request, h, errors) {
    // const pageContext = this.createPageContext(errors)
    const {authToken, application, applicationLine} = await this.createApplicationContext(request, {application: true, applicationLine: true})
    const payment = await Payment.getCardPaymentDetails(authToken, applicationLine.id)

    const paymentStatus = await payment.getCardPaymentResult(authToken)

    if (paymentStatus === 'success') {
      // TODO: Confirm if we need to set application.paymentReceived? Currently redirects to the 'not paid' screen
      application.paymentReceived = true
      await application.save(authToken)

      return this.redirect(request, h, Constants.Routes.APPLICATION_RECEIVED.path)
    } else {
      return this.redirect(request, h, Constants.Routes.PAYMENT.CARD_PROBLEM.path)
    }
  }
}
