'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const SiteNameAndLocation = require('../models/taskList/siteNameAndLocation.model')

module.exports = class SiteNameController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken, applicationId, applicationLineId, application} = await this.createApplicationContext(request, {application: true})

    if (application.isSubmitted()) {
      return this.redirect(request, reply, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    if (request.payload) {
      // If we have Location name in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'site-name': await SiteNameAndLocation.getSiteName(request, authToken, applicationId, applicationLineId)
      }
    }

    return this.showView(request, reply, 'siteName', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.details) {
      return this.doGet(request, reply, errors)
    } else {
      const {authToken, applicationId, applicationLineId} = await this.createApplicationContext(request)

      await SiteNameAndLocation.saveSiteName(request, request.payload['site-name'], authToken, applicationId, applicationLineId)

      return this.redirect(request, reply, Constants.Routes.SITE_GRID_REFERENCE.path)
    }
  }
}
