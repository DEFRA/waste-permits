'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const SiteNameAndLocation = require('../models/taskList/siteNameAndLocation.model')

module.exports = class SiteGridReferenceController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken, applicationId, applicationLineId, application} = await this.createApplicationContext(request, {application: true})

    if (application.isSubmitted()) {
      return this.redirect(request, reply, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    if (request.payload) {
      // If we have Site details in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'site-grid-reference': await SiteNameAndLocation.getGridReference(request, authToken, applicationId, applicationLineId)
      }
    }
    return this.showView(request, reply, 'siteGridReference', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.details) {
      return this.doGet(request, reply, errors)
    } else {
      const {authToken, applicationId, applicationLineId} = await this.createApplicationContext(request)

      await SiteNameAndLocation.saveGridReference(request, request.payload['site-grid-reference'],
        authToken, applicationId, applicationLineId)

      return this.redirect(request, reply, Constants.Routes.ADDRESS.POSTCODE_SITE.path)
    }
  }
}
