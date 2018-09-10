'use strict'

const BaseController = require('./base.controller')
const AddressDetail = require('../models/addressDetail.model')
const RecoveryService = require('../services/recovery.service')

module.exports = class ContactDetailsController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    const context = await RecoveryService.createApplicationContext(h, { application: true })
    const { applicationId } = context

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const { email } = await AddressDetail.getCompanySecretaryDetails(context, applicationId)
      pageContext.formValues = { email }
    }

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, { application: true })
      const { applicationId } = context
      const companySecretaryDetails = await AddressDetail.getCompanySecretaryDetails(context, applicationId)
      companySecretaryDetails.email = request.payload.email
      await companySecretaryDetails.save(context)

      return this.redirect({ request, h, redirectPath: this.nextPath })
    }
  }
}
