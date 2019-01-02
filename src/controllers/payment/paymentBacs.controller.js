'use strict'

const Dynamics = require('../../dynamics')
const BaseController = require('../base.controller')
const Payment = require('../../persistence/entities/payment.entity')
const RecoveryService = require('../../services/recovery.service')

module.exports = class PaymentBacsController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext(h)
    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h, { application: true, applicationLine: true })
    const { slug, application, applicationLine } = context

    const { value = 0 } = applicationLine
    const payment = await Payment.getBacsPaymentDetails(context, applicationLine.id)

    payment.value = value
    payment.category = Dynamics.PAYMENT_CATEGORY
    payment.statusCode = Dynamics.PaymentStatusCodes.ISSUED
    payment.applicationId = application.id
    payment.title = `${Dynamics.PaymentTitle.BACS_PAYMENT} ${application.applicationNumber}`
    await payment.save(context)

    application.submittedOn = Date.now()
    await application.save(context)

    return this.redirect({ h, path: `${this.nextPath}/${slug}` })
  }
}
