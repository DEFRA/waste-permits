'use strict'

const BaseController = require('./base.controller')
const ContactDetail = require('../models/contactDetail.model')
const RecoveryService = require('../services/recovery.service')
const { DESIGNATED_MEMBER_CONTACT_DETAILS } = require('../dynamics').AddressTypes

module.exports = class ContactDetailsController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const type = DESIGNATED_MEMBER_CONTACT_DETAILS.TYPE
      const contactDetail = await ContactDetail.get(context, { type })
      if (contactDetail) {
        pageContext.formValues = { email: contactDetail.email }
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { applicationId } = context
    const type = DESIGNATED_MEMBER_CONTACT_DETAILS.TYPE
    const contactDetail = (await ContactDetail.get(context, { type })) || new ContactDetail({ applicationId, type })
    contactDetail.email = request.payload.email
    await contactDetail.save(context)

    return this.redirect({ h })
  }
}
