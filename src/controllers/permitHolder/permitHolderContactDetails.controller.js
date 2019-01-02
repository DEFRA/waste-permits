'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const ContactDetail = require('../../models/contactDetail.model')

const { INDIVIDUAL_PERMIT_HOLDER } = require('../../dynamics').AddressTypes

module.exports = class PermitHolderContactDetailsController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const context = await RecoveryService.createApplicationContext(h)

      const type = INDIVIDUAL_PERMIT_HOLDER.TYPE
      const contactDetail = await ContactDetail.get(context, { type })

      if (contactDetail) {
        pageContext.formValues = {
          'email': contactDetail.email,
          'telephone': contactDetail.telephone
        }
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { application } = context
    const { email, telephone } = request.payload

    const type = INDIVIDUAL_PERMIT_HOLDER.TYPE
    const contactDetail = await ContactDetail.get(context, { type })

    // If we don't have a permit holder at this point something has gone wrong
    if (!contactDetail) {
      throw Error('Application does not have a permit holder')
    }

    Object.assign(contactDetail, { email, telephone })
    await contactDetail.save(context)

    application.permitHolderIndividualId = contactDetail.customerId
    await application.save(context)

    return this.redirect({ h })
  }
}
