'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const SiteSiteNameValidator = require('../validators/siteSiteName.validator')
const CookieService = require('../services/cookie.service')
const SiteNameAndLocation = require('../models/taskList/siteNameAndLocation.model')

module.exports = class SiteSiteNameController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors, new SiteSiteNameValidator())
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)
    const applicationLineId = CookieService.getApplicationLineId(request)

    if (request.payload) {
      // If we have Location name in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'site-name': await SiteNameAndLocation.getSiteName(request, authToken, applicationId, applicationLineId)
      }
    }

    return reply.view('siteSiteName', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      const applicationLineId = CookieService.getApplicationLineId(request)

      await SiteNameAndLocation.saveSiteName(request, request.payload['site-name'],
        authToken, applicationId, applicationLineId)

      return reply.redirect(Constants.Routes.SITE_GRID_REFERENCE.path)
    }
  }
}
