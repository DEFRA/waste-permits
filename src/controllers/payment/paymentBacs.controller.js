'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const Payment = require('../../models/payment.model')
const RecoveryService = require('../../services/recovery.service')

module.exports = class PaymentBacsController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext()
    const {authToken, applicationLineId, application} = await RecoveryService.createApplicationContext(h, {application: true})

    const payment = await Payment.getBacsPaymentDetails(authToken, applicationLineId)

    if (!application.isSubmitted()) {
      return this.redirect({request, h, redirectPath: Constants.Routes.ERROR.NOT_SUBMITTED.path})
    } else if ((payment && payment.statusCode === Constants.Dynamics.PaymentStatusCodes.ISSUED) || (application && application.paymentReceived)) {
      return this.redirect({request, h, redirectPath: Constants.Routes.ERROR.ALREADY_SUBMITTED.path})
    }

    return this.showView({request, h, viewPath: 'payment/paymentBacs', pageContext})
  }

  async doPost (request, h) {
    const {authToken, application, applicationLine} = await RecoveryService.createApplicationContext(h, {application: true, applicationLine: true})

    const {value = 0} = applicationLine
    const payment = await Payment.getBacsPaymentDetails(authToken, applicationLine.id)

    payment.value = value
    payment.category = Constants.Dynamics.PAYMENT_CATEGORY
    payment.statusCode = Constants.Dynamics.PaymentStatusCodes.ISSUED
    payment.applicationId = application.id
    payment.title = `${Constants.Dynamics.PaymentTitle.BACS_PAYMENT} ${application.applicationNumber}`
    await payment.save(authToken)

    return this.redirect({request, h, redirectPath: Constants.APPLICATION_RECEIVED_URL})
  }
}
