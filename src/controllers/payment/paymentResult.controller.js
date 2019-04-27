'use strict'

const Dynamics = require('../../dynamics')
const { MCP_PREFIX, WASTE_PREFIX } = require('../../constants').PAYMENT_CONFIGURATION_PREFIX
const { MCP } = Dynamics.FACILITY_TYPES
const { APPLICATION_RECEIVED, CARD_PROBLEM } = require('../../routes')
const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

module.exports = class PaymentResultController extends BaseController {
  async doGet (request, h) {
    const context = await RecoveryService.createApplicationContext(h, { applicationReturn: true, cardPayment: true })
    const { cardPayment, slug, taskDeterminants } = context
    const { facilityType } = taskDeterminants
    const paymentConfigurationPrefix = facilityType === MCP ? MCP_PREFIX : WASTE_PREFIX

    const paymentStatus = await cardPayment.getCardPaymentResult(context, paymentConfigurationPrefix)
    let path = `${APPLICATION_RECEIVED.path}/${slug}`

    // Look at the result of the payment and redirect off to the appropriate result screen
    if (paymentStatus !== 'success') {
      path = `${CARD_PROBLEM.path}/${slug}?status=${encodeURIComponent(paymentStatus)}`
    }

    return this.redirect({ h, path })
  }
}
