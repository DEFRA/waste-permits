'use strict'

const Constants = require('../../constants')
const Dynamics = require('../../dynamics')
const BaseController = require('../base.controller')
const Configuration = require('../../persistence/entities/configuration.entity')
const Payment = require('../../persistence/entities/payment.entity')
const RecoveryService = require('../../services/recovery.service')

const parseAmount = (amount) => {
  if (amount) {
    return Number.parseFloat(amount.replace(/[^0-9.]/g, ''))
  }
}

module.exports = class BacsProofController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h, { standardRule: true })
    const { application, isMcp } = context

    const bacsPayment = await Payment.getBacsPayment(context)
    if (!bacsPayment) {
      throw new Error('Bacs payment details not found')
    }

    pageContext.bacs = {
      paymentReference: `${isMcp ? 'MCP' : 'WP'}-${application.applicationNumber}`,
      amount: bacsPayment.value.toLocaleString(),
      sortCode: Constants.BankAccountDetails.SORT_CODE,
      accountNumber: Constants.BankAccountDetails.ACCOUNT_NUMBER,
      accountName: Constants.BankAccountDetails.ACCOUNT_NAME,
      ibanNumber: Constants.BankAccountDetails.IBAN_NUMBER,
      swiftNumber: Constants.BankAccountDetails.SWIFT_NUMBER,
      paymentEmail: await Configuration.getValue(context, Dynamics.BACS_EMAIL_CONFIG)
    }

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const { customerPaymentReference = '', customerPaymentAmount = '', customerPaymentDate } = bacsPayment
      const [year, month, day] = customerPaymentDate ? customerPaymentDate.toISOString().substring(0, 10).split('-') : ['', '', '']
      pageContext.formValues = {
        'date-paid-day': day,
        'date-paid-month': month,
        'date-paid-year': year,
        'amount-paid': customerPaymentAmount,
        'payment-reference': customerPaymentReference
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h, { applicationLine: true })
    const { slug, application } = context

    const bacsPayment = await Payment.getBacsPayment(context)
    if (!bacsPayment) {
      throw new Error('Bacs payment details not found')
    }

    const {
      'date-paid-day': day,
      'date-paid-month': month,
      'date-paid-year': year,
      'amount-paid': amount,
      'payment-reference': customerPaymentReference
    } = request.payload
    const customerPaymentDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
    const customerPaymentAmount = parseAmount(amount)

    Object.assign(bacsPayment, { customerPaymentDate, customerPaymentAmount, customerPaymentReference })

    await bacsPayment.save(context)

    // Mark the application as submitted by setting the submittedOn date - it will no longer be editable
    application.submittedOn = new Date()
    await application.save(context)

    return this.redirect({ h, path: `${this.nextPath}/${slug}` })
  }
}
