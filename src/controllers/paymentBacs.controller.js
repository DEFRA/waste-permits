'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const Payment = require('../models/payment.model')

module.exports = class PaymentBacsController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()
    const {application} = await this.createApplicationContext(request, {application: true})

    if (!application.isSubmitted()) {
      return this.redirect(request, reply, Constants.Routes.ERROR.NOT_SUBMITTED.path)
    }

    // TODO confirm if this is needed for BACS screen
    // returns Boolean(this.paymentReceived)

    // Needs alreadypaid screen??????
    // if (application.isPaidFor()) {
    //   return this.redirect(request, reply, Constants.Routes.ERROR.ALREADY_PAID.path)
    // }

    return this.showView(request, reply, 'paymentBacs', pageContext)
  }

  async doPost (request, reply) {
    const {authToken, applicationLine} = await this.createApplicationContext(request, {application: false, applicationLine: true})

    const {value = 0} = applicationLine
    const payment = await Payment.getBacsPaymentDetails(authToken, applicationLine.id)

    payment.value = value
    payment.category = Constants.Dynamics.PAYMENT_CATEGORY
    payment.statusCode = Constants.Dynamics.PaymentStatusCodes.ISSUED
    await payment.save(authToken)

    return this.redirect(request, reply, Constants.Routes.APPLICATION_RECEIVED.path)
  }
}
