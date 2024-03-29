'use strict'

const config = require('../../config/config')
const Dynamics = require('../../dynamics')
const Routes = require('../../routes')
const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')
const ApplicationCost = require('../../models/applicationCost.model')
const { CARD_PAYMENT, BACS_PAYMENT } = Dynamics.PaymentTypes

module.exports = class PaymentTypeController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h, { applicationLine: true, applicationReturn: true })
    const { applicationReturn } = context

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

    const applicationCost = await ApplicationCost.getApplicationCostForApplicationId(context)

    // Default to 0 when the cost hasn't been set
    const value = applicationCost.total.cost ? applicationCost.total.cost : 0

    pageContext.cost = value.toLocaleString()

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    let path
    const { cookie, applicationReturn, slug } =
      await RecoveryService.createApplicationContext(h, { applicationLine: true, applicationReturn: true })

    // try to find a slug, otherwise make it an empty string
    const finalSlug = applicationReturn
      ? applicationReturn.slug
      : slug || ''

    const paymentType = parseInt(request.payload['payment-type'])
    switch (paymentType) {
      case CARD_PAYMENT: {
        const origin = config.wastePermitsAppUrl || request.headers.origin
        const returnUrl = `${origin}${Routes.PAYMENT_RESULT.path}/${finalSlug}`
        path = `${Routes.CARD_PAYMENT.path}?returnUrl=${encodeURI(returnUrl)}`
        break
      }
      case BACS_PAYMENT:
        path = Routes.BACS_PAYMENT.path
        break
      default:
        throw new Error(`Unexpected payment type (${paymentType})`)
    }
    return this.redirect({ h, path, cookie })
  }
}
