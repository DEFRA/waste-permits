'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')
const Payment = require('../../models/payment.model')

module.exports = class PaymentResultController extends BaseController {
  async doGet (request, h) {
    const {slug = ''} = request.params
    const {authToken, application, applicationLineId} = slug ? await RecoveryService.recoverApplication(slug, h) : await this.createApplicationContext(request, {application: true})
    const payment = await Payment.getCardPaymentDetails(authToken, applicationLineId)

    if (!application.isSubmitted()) {
      return this.redirect({request, h, redirectPath: Constants.Routes.ERROR.NOT_SUBMITTED.path})
    }

    const paymentStatus = await payment.getCardPaymentResult(authToken)
    let redirectPath = `${Constants.APPLICATION_RECEIVED_URL}/${slug}`

    // Look at the result of the payment and redirect off to the appropriate result screen
    if (paymentStatus === 'success') {
      application.paymentReceived = true
      await application.save(authToken)
    } else {
      redirectPath = `${Constants.Routes.PAYMENT.CARD_PROBLEM.path}?status=${encodeURIComponent(paymentStatus)}`
    }

    return this.redirect({request, h, redirectPath})
  }
}
