'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const Payment = require('../../models/payment.model')
const LoggingService = require('../../services/logging.service')

module.exports = class CardPaymentController extends BaseController {
  async doGet (request, h, errors) {
    const {authToken, application, applicationLine, standardRule} = await this.createApplicationContext(request, {application: true, applicationLine: true, standardRule: true})

    let payment = await Payment.getCardPaymentDetails(authToken, applicationLine.id)

    if (!application.isSubmitted()) {
      return this.redirect(request, h, Constants.Routes.ERROR.NOT_SUBMITTED.path)
    }

    const {value = 0} = applicationLine
    payment.description = `Application charge for a standard rules waste permit: ${standardRule.permitName} ${standardRule.code}`
    payment.value = value
    payment.category = Constants.Dynamics.PAYMENT_CATEGORY
    await payment.save(authToken)

    // TODO remove this - only needed for local dev instead of the returnUrl specified below. This is because
    // Gov Pay needs an https address to redirect to, otherwise it throws a runtime error

    // let returnUrl = 'http://defra.gov.uk'
    let returnUrl = `${request.server.info.protocol}://${request.info.host}${Constants.Routes.PAYMENT.PAYMENT_RESULT.path}`

    // Ensure that it redirects back to an https address otherwise the payment will fail
    returnUrl = returnUrl.replace('http://', 'https://')

    LoggingService.logDebug(`Making Gov.UK Pay card payment. Will redirect back to: ${returnUrl}`)

    const govPayUrl = await payment.makeCardPayment(authToken, payment.description, returnUrl)

    LoggingService.logDebug(`Gov.UK Pay card payment URL: ${govPayUrl}`)

    // Re-direct off to Gov.UK Pay to take the payment
    return this.redirect(request, h, govPayUrl)
  }
}
