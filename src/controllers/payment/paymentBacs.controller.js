'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const Payment = require('../../models/payment.model')

module.exports = class PaymentBacsController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext()
    const {authToken, applicationLineId, application} = await this.createApplicationContext(request, {application: true})

    const payment = await Payment.getBacsPaymentDetails(authToken, applicationLineId)

    if (!application.isSubmitted()) {
      return this.redirect(request, h, Constants.Routes.ERROR.NOT_SUBMITTED.path)
    } else if (payment && payment.statusCode === Constants.Dynamics.PaymentStatusCodes.ISSUED) {
      return this.redirect(request, h, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    return this.showView(request, h, 'payment/paymentBacs', pageContext)
  }

  async doPost (request, h) {
    const {authToken, applicationLine} = await this.createApplicationContext(request, {application: false, applicationLine: true})

    const {value = 0} = applicationLine
    const payment = await Payment.getBacsPaymentDetails(authToken, applicationLine.id)

    payment.value = value
    payment.category = Constants.Dynamics.PAYMENT_CATEGORY
    payment.statusCode = Constants.Dynamics.PaymentStatusCodes.ISSUED
    await payment.save(authToken)

    return this.redirect(request, h, Constants.Routes.APPLICATION_RECEIVED.path)
  }
}
