'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const Payment = require('../models/payment.model')
const RecoveryService = require('../services/recovery.service')
const LoggingService = require('../services/logging.service')

module.exports = class ApplicationReceivedController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext()
    const {authToken, applicationId, applicationLineId, application, contact} = await RecoveryService.createApplicationContext(h, {application: true, contact: true})

    const bacsPayment = await Payment.getBacsPayment(authToken, applicationLineId)
    const cardPayment = await Payment.getCardPayment(authToken, applicationLineId)

    pageContext.applicationName = application.applicationName
    if (contact && contact.email) {
      pageContext.contactEmail = contact.email
    } else {
      LoggingService.logError(`Unable to get Contact email address for application ID: ${applicationId}`)
      pageContext.contactEmail = 'UNKNOWN EMAIL ADDRESS'
    }

    if (bacsPayment) {
      pageContext.bacs = {
        paymentReference: `WP-${application.applicationName}`,
        amount: bacsPayment.value.toLocaleString(),
        sortCode: Constants.BankAccountDetails.SORT_CODE,
        accountNumber: Constants.BankAccountDetails.ACCOUNT_NUMBER,
        accountName: Constants.BankAccountDetails.ACCOUNT_NAME,
        ibanNumber: Constants.BankAccountDetails.IBAN_NUMBER,
        swiftNumber: Constants.BankAccountDetails.SWIFT_NUMBER,
        paymentEmail: Constants.BankAccountDetails.PAYMENT_EMAIL
      }
    } else if (cardPayment) {
      pageContext.pageHeading = Constants.Routes.APPLICATION_RECEIVED.pageHeadingAlternate
      pageContext.cardPayment = {
        description: cardPayment.description,
        amount: cardPayment.value.toLocaleString()
      }
    }

    if (bacsPayment || cardPayment || application.isPaid()) {
      return this.showView({request, h, viewPath: 'applicationReceived', pageContext})
    } else {
      // If the application has not been paid for
      return this.redirect({request, h, redirectPath: Constants.Routes.ERROR.NOT_PAID.path})
    }
  }
}
