'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const Payment = require('../models/payment.model')

module.exports = class ApplicationReceivedController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()

    const {authToken, applicationLineId, application, contact} = await this.createApplicationContext(request, {application: true, contact: true})

    const bacsPayment = await Payment.getByApplicationLineIdAndType(authToken, applicationLineId, Constants.Dynamics.PaymentTypes.BACS_PAYMENT)

    pageContext.applicationName = application.applicationName
    pageContext.contactEmail = contact.email

    if (bacsPayment) {
      pageContext.bacs = {
        paymentReference: `WP-${application.applicationName}`,
        amount: bacsPayment.value.toLocaleString(),
        sortCode: Constants.BankAccountDetails.SORT_CODE,
        accountNumber: Constants.BankAccountDetails.ACCOUNT_NUMBER,
        ibanNumber: Constants.BankAccountDetails.IBAN_NUMBER,
        swiftNumber: Constants.BankAccountDetails.SWIFT_NUMBER,
        paymentEmail: Constants.BankAccountDetails.PAYMENT_EMAIL
      }
    }

    if (bacsPayment || application.isPaidFor()) {
      return this.showView(request, reply, 'applicationReceived', pageContext)
    } else {
      // If bacs has not been selected for payment and the application has not been paid for
      return this.redirect(request, reply, Constants.Routes.ERROR.NOT_PAID.path)
    }
  }
}
