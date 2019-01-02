'use strict'

const config = require('../../config/config')
const Dynamics = require('../../dynamics')
const Routes = require('../../routes')
const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')
const { CARD_PAYMENT, BACS_PAYMENT } = Dynamics.PaymentTypes

module.exports = class PaymentTypeController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h, { application: true, applicationLine: true, applicationReturn: true })
    const { applicationLine, applicationReturn } = context

    this.path = this.path.replace('{slug?}', applicationReturn ? applicationReturn.slug : '')
    const pageContext = this.createPageContext(h, errors)

    const { status } = request.query || {}
    if (status === 'error') {
      pageContext.error = true
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
    const { value = 0 } = applicationLine || {}

    pageContext.cost = value.toLocaleString()

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    let path
    const { cookie, applicationReturn } = await RecoveryService.createApplicationContext(h, { applicationReturn: true })
    const paymentType = parseInt(request.payload['payment-type'])
    switch (paymentType) {
      case CARD_PAYMENT:
        let origin = config.wastePermitsAppUrl || request.headers.origin
        let returnUrl = `${origin}${Routes.PAYMENT_RESULT.path}/${applicationReturn.slug}`
        path = `${Routes.CARD_PAYMENT.path}?returnUrl=${encodeURI(returnUrl)}`
        break
      case BACS_PAYMENT:
        path = Routes.BACS_PAYMENT.path
        break
      default:
        throw new Error(`Unexpected payment type (${paymentType})`)
    }
    return this.redirect({ h, path, cookie })
  }
}
