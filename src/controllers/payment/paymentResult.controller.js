'use strict'

const { APPLICATION_RECEIVED, CARD_PROBLEM } = require('../../routes')
const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

module.exports = class PaymentResultController extends BaseController {
  async doGet (request, h) {
    const context = await RecoveryService.createApplicationContext(h, { application: true, applicationReturn: true, cardPayment: true })
    const { application, applicationReturn, cardPayment } = context

    const paymentStatus = await cardPayment.getCardPaymentResult(context)
    let redirectPath = `${APPLICATION_RECEIVED.path}/${applicationReturn.slug}`

    // Look at the result of the payment and redirect off to the appropriate result screen
    if (paymentStatus === 'success') {
      application.paymentReceived = true
      await application.save(context)
    } else {
      redirectPath = `${CARD_PROBLEM.path}/${applicationReturn.slug}?status=${encodeURIComponent(paymentStatus)}`
    }

    return this.redirect({ request, h, redirectPath })
  }
}
