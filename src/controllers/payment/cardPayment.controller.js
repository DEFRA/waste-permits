'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const Payment = require('../../models/payment.model')
const LoggingService = require('../../services/logging.service')
const RecoveryService = require('../../services/recovery.service')

module.exports = class CardPaymentController extends BaseController {
  async doGet (request, h) {
    const context = await RecoveryService.createApplicationContext(h, {application: true, applicationLine: true, standardRule: true})
    const {application, applicationLine, standardRule} = context

    let {returnUrl} = request.query

    let payment = await Payment.getCardPaymentDetails(context, applicationLine.id)

    if (!application.isSubmitted()) {
      return this.redirect({request, h, redirectPath: Constants.Routes.ERROR.NOT_SUBMITTED.path})
    }

    const {value = 0} = applicationLine
    payment.description = `Application charge for a standard rules waste permit: ${standardRule.permitName} ${standardRule.code}`
    payment.value = value
    payment.category = Constants.Dynamics.PAYMENT_CATEGORY
    payment.applicationId = application.id
    payment.title = `${Constants.Dynamics.PaymentTitle.CARD_PAYMENT} ${application.applicationNumber}`
    await payment.save(context)

    // Note - Gov Pay needs an https address to redirect to, otherwise it throws a runtime error
    LoggingService.logDebug(`Making Gov.UK Pay card payment for Application "${this.applicationNumber}. Will redirect back to: ${returnUrl}`)

    const govPayUrl = await payment.makeCardPayment(context, payment.description, returnUrl)

    LoggingService.logDebug(`Gov.UK Pay card payment URL: ${govPayUrl}`)

    // Re-direct off to Gov.UK Pay to take the payment
    return this.redirect({request, h, redirectPath: govPayUrl})
  }
}
