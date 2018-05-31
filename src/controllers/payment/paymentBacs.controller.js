'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const Payment = require('../../models/payment.model')
const RecoveryService = require('../../services/recovery.service')

module.exports = class PaymentBacsController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext()
    const context = await RecoveryService.createApplicationContext(h, {application: true})
    const {applicationLineId, application} = context

    const payment = await Payment.getBacsPaymentDetails(context, applicationLineId)

    if (!application.isSubmitted()) {
      return this.redirect({request, h, redirectPath: Constants.Routes.ERROR.NOT_SUBMITTED.path})
    } else if ((payment && payment.statusCode === Constants.Dynamics.PaymentStatusCodes.ISSUED) || (application && application.paymentReceived)) {
      return this.redirect({request, h, redirectPath: Constants.Routes.ERROR.ALREADY_SUBMITTED.path})
    }

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h, {application: true, applicationLine: true})
    const {application, applicationLine} = context

    const {value = 0} = applicationLine
    const payment = await Payment.getBacsPaymentDetails(context, applicationLine.id)

    payment.value = value
    payment.category = Constants.Dynamics.PAYMENT_CATEGORY
    payment.statusCode = Constants.Dynamics.PaymentStatusCodes.ISSUED
    payment.applicationId = application.id
    payment.title = `${Constants.Dynamics.PaymentTitle.BACS_PAYMENT} ${application.applicationNumber}`
    await payment.save(context)

    return this.redirect({request, h, redirectPath: Constants.APPLICATION_RECEIVED_URL})
  }
}
