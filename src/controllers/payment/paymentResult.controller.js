'use strict'

const { APPLICATION_RECEIVED, CARD_PROBLEM } = require('../../routes')
const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

module.exports = class PaymentResultController extends BaseController {
  async doGet (request, h) {
    const context = await RecoveryService.createApplicationContext(h, { applicationReturn: true, cardPayment: true })
    const { cardPayment, slug } = context

    const paymentStatus = await cardPayment.getCardPaymentResult(context)
    let path = `${APPLICATION_RECEIVED.path}/${slug}`

    // Look at the result of the payment and redirect off to the appropriate result screen
    if (paymentStatus !== 'success') {
      path = `${CARD_PROBLEM.path}/${slug}?status=${encodeURIComponent(paymentStatus)}`
    }

    return this.redirect({ h, path })
  }
}
