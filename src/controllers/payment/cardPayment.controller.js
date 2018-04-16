'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const Payment = require('../../models/payment.model')

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

    // const returnUrl = 'https://defra.gov.uk'

    const returnUrl = `${request.server.info.protocol}://${request.info.host}${Constants.Routes.PAYMENT.PAYMENT_RESULT.path}`

    const govPayUrl = await payment.makeCardPayment(authToken, payment.description, returnUrl)

    // Re-direct off to Gov.UK Pay to take the payment
    return this.redirect(request, h, govPayUrl)
  }
}
