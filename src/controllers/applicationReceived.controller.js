'use strict'

const { PRIMARY_CONTACT_DETAILS } = require('../dynamics').AddressTypes
const BaseController = require('./base.controller')
const Payment = require('../persistence/entities/payment.entity')
const ContactDetail = require('../models/contactDetail.model')
const RecoveryService = require('../services/recovery.service')
const LoggingService = require('../services/logging.service')

module.exports = class ApplicationReceivedController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext(h)
    const context = await RecoveryService.createApplicationContext(h)
    const { applicationId, application } = context

    const bacsPayment = await Payment.getBacsPayment(context)
    const cardPayment = await Payment.getCardPayment(context)

    const { email } = await ContactDetail.get(context, { type: PRIMARY_CONTACT_DETAILS.TYPE }) || {}

    pageContext.applicationNumber = application.applicationNumber
    if (email) {
      pageContext.contactEmail = email
    } else {
      LoggingService.logError(`Unable to get Contact email address for application ID: ${applicationId}`)
      pageContext.contactEmail = 'UNKNOWN EMAIL ADDRESS'
    }

    if (bacsPayment) {
      pageContext.bacs = true
    } else if (cardPayment) {
      pageContext.pageHeading = this.route.pageHeadingAlternate
      pageContext.cardPayment = {
        description: cardPayment.description,
        amount: cardPayment.value.toLocaleString()
      }
    }

    return this.showView({ h, pageContext })
  }
}
