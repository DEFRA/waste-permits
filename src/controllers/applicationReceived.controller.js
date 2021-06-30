'use strict'

const pdf = require('../services/pdf')
const moment = require('moment')
const UploadService = require('../services/upload.service')
const { APPLICATION_FORM } = require('../constants').UploadSubject
const { PRIMARY_CONTACT_DETAILS } = require('../dynamics').AddressTypes
const BaseController = require('./base.controller')
const Payment = require('../persistence/entities/payment.entity')
const ContactDetail = require('../models/contactDetail.model')
const RecoveryService = require('../services/recovery.service')
const LoggingService = require('../services/logging.service')
const CheckList = require('../models/checkList/checkList')

module.exports = class ApplicationReceivedController extends BaseController {
  async saveApplicationPdf (context) {
    const { application } = context

    const checkList = new CheckList()
    const sections = await checkList.buildSections(context)

    const pdfStream = pdf.createPDFStream(sections, application)
    const dateStr = moment().format('YYYY-MM-DD-HH-mm-ss')
    const name = `_Application-${dateStr}`.replace(/\//g, '_')
    try {
      Object.assign(pdfStream, {
        hapi: {
          filename: `${name}.pdf`,
          name,
          headers: 'application/pdf'
        }
      })
      pdfStream.end()
      await UploadService.upload(
        context,
        application,
        pdfStream,
        APPLICATION_FORM
      )
    } catch (err) {
      LoggingService.logError(`Unable to send ${name} application pdf to dynamics`, err)
    }
  }

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

    await this.saveApplicationPdf(context)

    return this.showView({ h, pageContext })
  }
}
