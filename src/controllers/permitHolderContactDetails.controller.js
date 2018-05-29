'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')

const Contact = require('../models/contact.model')

module.exports = class PermitHolderContactDetailsController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const {individualPermitHolder} = await RecoveryService.createApplicationContext(h, {individualPermitHolder: true})

      // If we don't have a permit holder at this point something has gone wrong
      if (!individualPermitHolder) {
        throw Error('Application does not have a permit holder')
      }

      pageContext.formValues = {
        'email': individualPermitHolder.email
        // TODO: Add telephone
      }
    }

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const { authToken, application, individualPermitHolder } = await RecoveryService.createApplicationContext(h, { application: true, individualPermitHolder: true })
      const {
        email
        // TODO: Add telephone
      } = request.payload
      let contact

      // If we don't have a permit holder at this point something has gone wrong
      if (!individualPermitHolder) {
        throw Error('Application does not have a permit holder')
      }

      const { id: individualPermitHolderId, firstName, lastName } = individualPermitHolder

      contact = await Contact.getByFirstnameLastnameEmail(authToken, firstName, lastName, email)

      if (contact && contact.id !== individualPermitHolderId) {
        application.permitHolderIndividualId = contact.id
        await application.save(authToken)
        await individualPermitHolder.delete(authToken, individualPermitHolderId)
      } else {
        individualPermitHolder.email = email
        await individualPermitHolder.save(authToken)
      }

      return this.redirect({ request, h, redirectPath: Constants.Routes.ADDRESS.POSTCODE_PERMIT_HOLDER.path })
    }
  }
}
