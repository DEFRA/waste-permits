'use strict'

const Dynamics = require('../../dynamics')
const BaseController = require('../base.controller')
const Payment = require('../../persistence/entities/payment.entity')
const RecoveryService = require('../../services/recovery.service')
const ApplicationCost = require('../../models/applicationCost.model')

module.exports = class PaymentBacsController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext(h)
    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h, { applicationLine: true })
    const { application } = context

    const applicationCost = await ApplicationCost.getApplicationCostForApplicationId(context)
    const value = applicationCost.total.cost

    const payment = await Payment.getBacsPaymentDetails(context)

    payment.value = value
    payment.category = Dynamics.PAYMENT_CATEGORY
    payment.statusCode = Dynamics.PaymentStatusCodes.ISSUED
    payment.applicationId = application.id
    payment.title = `${Dynamics.PaymentTitle.BACS_PAYMENT} ${application.applicationNumber}`
    await payment.save(context)

    return this.redirect({ h, path: `${this.nextPath}` })
  }
}
