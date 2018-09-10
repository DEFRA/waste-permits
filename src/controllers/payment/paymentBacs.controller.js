'use strict'

const Dynamics = require('../../dynamics')
const Routes = require('../../routes')
const BaseController = require('../base.controller')
const Payment = require('../../models/payment.model')
const RecoveryService = require('../../services/recovery.service')

module.exports = class PaymentBacsController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext(request)
    const context = await RecoveryService.createApplicationContext(h, { application: true })
    const { applicationLineId, application } = context

    const payment = await Payment.getBacsPaymentDetails(context, applicationLineId)

    if (!application.isSubmitted()) {
      return this.redirect({ request, h, redirectPath: Routes.NOT_SUBMITTED.path })
    } else if ((payment && payment.statusCode === Dynamics.PaymentStatusCodes.ISSUED) || (application && application.paymentReceived)) {
      return this.redirect({ request, h, redirectPath: Routes.ALREADY_SUBMITTED.path })
    }

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h, { application: true, applicationLine: true })
    const { application, applicationLine } = context

    const { value = 0 } = applicationLine
    const payment = await Payment.getBacsPaymentDetails(context, applicationLine.id)

    payment.value = value
    payment.category = Dynamics.PAYMENT_CATEGORY
    payment.statusCode = Dynamics.PaymentStatusCodes.ISSUED
    payment.applicationId = application.id
    payment.title = `${Dynamics.PaymentTitle.BACS_PAYMENT} ${application.applicationNumber}`
    await payment.save(context)

    return this.redirect({ request, h, redirectPath: Routes.APPLICATION_RECEIVED.path })
  }
}
