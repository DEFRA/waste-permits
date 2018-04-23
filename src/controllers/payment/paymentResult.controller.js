'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

module.exports = class PaymentResultController extends BaseController {
  async doGet (request, h) {
    const {authToken, application, applicationReturn, cardPayment} = await RecoveryService.createApplicationContext(h, {application: true, applicationReturn: true, cardPayment: true})

    if (!application.isSubmitted()) {
      return this.redirect({request, h, redirectPath: Constants.Routes.ERROR.NOT_SUBMITTED.path})
    }

    const paymentStatus = await cardPayment.getCardPaymentResult(authToken)
    let redirectPath = `${Constants.APPLICATION_RECEIVED_URL}/${applicationReturn.slug}`

    // Look at the result of the payment and redirect off to the appropriate result screen
    if (paymentStatus === 'success') {
      application.paymentReceived = true
      await application.save(authToken)
    } else {
      redirectPath = `${Constants.PAYMENT_CARD_PROBLEM_URL}/${applicationReturn.slug}?status=${encodeURIComponent(paymentStatus)}`
    }

    return this.redirect({request, h, redirectPath})
  }
}
