'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const Payment = require('../../models/payment.model')
const LoggingService = require('../../services/logging.service')

module.exports = class CardPaymentController extends BaseController {
  async doGet (request, h) {
    const {authToken, application, applicationLine, standardRule} = await this.createApplicationContext(request, {application: true, applicationLine: true, standardRule: true})

    let {returnUrl} = request.query

    let payment = await Payment.getCardPaymentDetails(authToken, applicationLine.id)

    if (!application.isSubmitted()) {
      return this.redirect({request, h, redirectPath: Constants.Routes.ERROR.NOT_SUBMITTED.path})
    }

    const {value = 0} = applicationLine
    payment.description = `Application charge for a standard rules waste permit: ${standardRule.permitName} ${standardRule.code}`
    payment.value = value
    payment.category = Constants.Dynamics.PAYMENT_CATEGORY
    payment.applicationId = application.id
    payment.title = `${Constants.Dynamics.PaymentTitle.CARD_PAYMENT} ${application.applicationNumber}`
    await payment.save(authToken)

    // Note - Gov Pay needs an https address to redirect to, otherwise it throws a runtime error
    returnUrl = `${returnUrl}?id=${payment.id}`

    LoggingService.logDebug(`Making Gov.UK Pay card payment. Will redirect back to: ${returnUrl}`)

    const govPayUrl = await payment.makeCardPayment(authToken, payment.description, returnUrl)

    LoggingService.logDebug(`Gov.UK Pay card payment URL: ${govPayUrl}`)

    // Re-direct off to Gov.UK Pay to take the payment
    return this.redirect({request, h, redirectPath: govPayUrl})
  }
}
