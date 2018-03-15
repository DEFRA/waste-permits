'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const SiteNameAndLocation = require('../models/taskList/siteNameAndLocation.model')

module.exports = class SiteGridReferenceController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken, applicationId, applicationLineId, application, payment} = await this.createApplicationContext(request, {application: true, payment: true})

    const redirectPath = await this.checkRouteAccess(application, payment)
    if (redirectPath) {
      return this.redirect(request, h, redirectPath)
    }

    if (request.payload) {
      // If we have Site details in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'site-grid-reference': await SiteNameAndLocation.getGridReference(request, authToken, applicationId, applicationLineId)
      }
    }
    return this.showView(request, h, 'siteGridReference', pageContext)
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const {authToken, applicationId, applicationLineId} = await this.createApplicationContext(request)

      await SiteNameAndLocation.saveGridReference(request, request.payload['site-grid-reference'],
        authToken, applicationId, applicationLineId)

      return this.redirect(request, h, Constants.Routes.ADDRESS.POSTCODE_SITE.path)
    }
  }
}
