'use strict'

const Constants = require('../constants')
const { BACS_EMAIL_CONFIG } = require('../dynamics')
const BaseController = require('./base.controller')
const Configuration = require('../persistence/entities/configuration.entity')
const Payment = require('../persistence/entities/payment.entity')
const RecoveryService = require('../services/recovery.service')
const LoggingService = require('../services/logging.service')

module.exports = class ApplicationReceivedController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext(request)
    const context = await RecoveryService.createApplicationContext(h, { application: true, contact: true })
    const { applicationId, applicationLineId, application, contact } = context

    const bacsPayment = await Payment.getBacsPayment(context, applicationLineId)
    const cardPayment = await Payment.getCardPayment(context, applicationLineId)

    pageContext.applicationNumber = application.applicationNumber
    if (contact && contact.email) {
      pageContext.contactEmail = contact.email
    } else {
      LoggingService.logError(`Unable to get Contact email address for application ID: ${applicationId}`)
      pageContext.contactEmail = 'UNKNOWN EMAIL ADDRESS'
    }

    if (bacsPayment) {
      pageContext.bacs = {
        paymentReference: `WP-${application.applicationNumber}`,
        amount: bacsPayment.value.toLocaleString(),
        sortCode: Constants.BankAccountDetails.SORT_CODE,
        accountNumber: Constants.BankAccountDetails.ACCOUNT_NUMBER,
        accountName: Constants.BankAccountDetails.ACCOUNT_NAME,
        ibanNumber: Constants.BankAccountDetails.IBAN_NUMBER,
        swiftNumber: Constants.BankAccountDetails.SWIFT_NUMBER,
        paymentEmail: await Configuration.getValue(context, BACS_EMAIL_CONFIG)
      }
    } else if (cardPayment) {
      pageContext.pageHeading = this.route.pageHeadingAlternate
      pageContext.cardPayment = {
        description: cardPayment.description,
        amount: cardPayment.value.toLocaleString()
      }
    }

    return this.showView({ request, h, pageContext })
  }
}
