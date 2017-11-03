'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const SiteGridReferenceValidator = require('../validators/siteGridReference.validator')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const SiteNameAndLocation = require('../models/taskList/siteNameAndLocation.model')

module.exports = class SiteGridReferenceController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.SITE_GRID_REFERENCE, errors, SiteGridReferenceValidator)
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
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return SiteGridReferenceController.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      const applicationLineId = CookieService.getApplicationLineId(request)

      try {
        await SiteNameAndLocation.saveGridReference(request, request.payload['site-grid-reference'],
          authToken, applicationId, applicationLineId)

        return reply.redirect(Constants.Routes.POSTCODE.path)
      } catch (error) {
        LoggingService.logError(error, request)
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, SiteGridReferenceController)
  }
}
