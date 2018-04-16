'use strict'

const Constants = require('../../constants')
const config = require('../../config/config')
const BaseController = require('../base.controller')
const Payment = require('../../models/payment.model')

module.exports = class CardPaymentController extends BaseController {
  async doGet (request, h, errors) {
    const {authToken, applicationLine, standardRule} = await this.createApplicationContext(request, {applicationLine: true, standardRule: true})

    let payment = await Payment.getCardPaymentDetails(authToken, applicationLine.id)
    const {value = 0} = applicationLine

    payment.description = `Application charge for a standard rules waste permit: ${standardRule.permitName} ${standardRule.code}`
    payment.value = value
    payment.category = Constants.Dynamics.PAYMENT_CATEGORY
    await payment.save(authToken)

    // TODO remove this
    const returnUrl = 'https://defra.gov.uk'
    // const returnUrl = `${request.server.info.protocol}://${request.info.host}/pay/result`

    const govPayUrl = await payment.makeCardPayment(authToken, payment.description, returnUrl)

    // Re-direct off to Gov.UK Pay
    return this.redirect(request, h, govPayUrl)
  }
}
