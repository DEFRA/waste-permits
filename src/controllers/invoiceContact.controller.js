'use strict'

const BaseController = require('./base.controller')
const ContactDetail = require('../models/contactDetail.model')
const RecoveryService = require('../services/recovery.service')
const { BILLING_INVOICING } = require('../dynamics').AddressTypes

module.exports = class InvoiceContactController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const type = BILLING_INVOICING.TYPE
      const contactDetail = await ContactDetail.get(context, { type })
      if (contactDetail) {
        pageContext.formValues = {
          'first-name': contactDetail.firstName,
          'last-name': contactDetail.lastName,
          'telephone': contactDetail.telephone,
          'email': contactDetail.email
        }
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { applicationId, application } = context
    const {
      'first-name': firstName,
      'last-name': lastName,
      telephone,
      email
    } = request.payload

    const type = BILLING_INVOICING.TYPE
    const contactDetail = (await ContactDetail.get(context, { type })) || new ContactDetail({ applicationId, type })

    Object.assign(contactDetail, { firstName, lastName, telephone, email })
    await contactDetail.save(context)

    application.contactId = contactDetail.customerId
    await application.save(context)

    return this.redirect({ h })
  }
}
