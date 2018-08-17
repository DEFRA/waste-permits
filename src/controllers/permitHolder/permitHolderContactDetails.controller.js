'use strict'

const Routes = require('../../routes')
const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const Contact = require('../../models/contact.model')
const AddressDetail = require('../../models/addressDetail.model')

module.exports = class PermitHolderContactDetailsController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const context = await RecoveryService.createApplicationContext(h, { individualPermitHolder: true, application: true })
      const { individualPermitHolder = { email: '' }, application } = context

      const individualPermitHolderDetails = await AddressDetail.getIndividualPermitHolderDetails(context, application.id)

      pageContext.formValues = {
        'email': individualPermitHolder.email,
        'telephone': individualPermitHolderDetails.telephone
      }
    }

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, { application: true, individualPermitHolder: true })
      const { application, individualPermitHolder } = context
      const {
        email,
        telephone
      } = request.payload
      let contact

      // If we don't have a permit holder at this point something has gone wrong
      if (!individualPermitHolder) {
        throw Error('Application does not have a permit holder')
      }

      const { id: individualPermitHolderId, firstName, lastName } = individualPermitHolder

      contact = await Contact.getByFirstnameLastnameEmail(context, firstName, lastName, email)

      if (!contact) {
        contact = new Contact({ firstName, lastName, email })
        await contact.save(context)
      }

      if (contact.id !== individualPermitHolderId) {
        application.permitHolderIndividualId = contact.id
        await application.save(context)
      }

      const individualPermitHolderDetails = await AddressDetail.getIndividualPermitHolderDetails(context, application.id)
      individualPermitHolderDetails.telephone = telephone
      await individualPermitHolderDetails.save(context)

      return this.redirect({ request, h, redirectPath: Routes.POSTCODE_PERMIT_HOLDER.path })
    }
  }
}
