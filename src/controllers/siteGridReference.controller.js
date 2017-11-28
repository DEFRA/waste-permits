'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const SiteGridReferenceValidator = require('../validators/siteGridReference.validator')
const CookieService = require('../services/cookie.service')
const SiteNameAndLocation = require('../models/taskList/siteNameAndLocation.model')

module.exports = class SiteGridReferenceController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors, SiteGridReferenceValidator)
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)
    const applicationLineId = CookieService.getApplicationLineId(request)

    if (request.payload) {
      // If we have Site details in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'site-grid-reference': await SiteNameAndLocation.getGridReference(request, authToken, applicationId, applicationLineId)
      }
    }
    return reply.view('siteGridReference', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      const applicationLineId = CookieService.getApplicationLineId(request)

      await SiteNameAndLocation.saveGridReference(request, request.payload['site-grid-reference'],
        authToken, applicationId, applicationLineId)

      return reply.redirect(Constants.Routes.POSTCODE.path)
    }
  }
}
