'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const {CARD_PAYMENT, BACS_PAYMENT} = Constants.Dynamics.PaymentTypes

module.exports = class PaymentTypeController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {application, applicationLine} = await this.createApplicationContext(request, {application: true, applicationLine: true})

    if (!application.isSubmitted()) {
      return this.redirect({request, h, redirectPath: Constants.Routes.ERROR.NOT_SUBMITTED.path})
    }

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {}
    }

    Object.assign(pageContext.formValues, {
      'card-payment': CARD_PAYMENT,
      'bacs-payment': BACS_PAYMENT
    })

    // Default to 0 when the balance hasn't been set
    const {value = 0} = applicationLine

    pageContext.cost = value.toLocaleString()

    return this.showView({request, h, viewPath: 'payment/paymentType', pageContext})
  }

  async doPost (request, h, errors) {
    let nextPath
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const paymentType = parseInt(request.payload['payment-type'])
      switch (paymentType) {
        case CARD_PAYMENT:
          nextPath = Constants.Routes.PAYMENT.CARD_PAYMENT.path
          break
        case BACS_PAYMENT:
          nextPath = Constants.Routes.PAYMENT.BACS_PAYMENT.path
          break
        default:
          throw new Error(`Unexpected payment type (${paymentType})`)
      }
      return this.redirect({request, h, redirectPath: nextPath})
    }
  }
}
