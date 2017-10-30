'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const SiteGridReferenceValidator = require('../validators/siteGridReference.validator')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const Site = require('../models/site.model')

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
        // Get the Site for this application (if we have one)
        try {
          const site = await Site.getByApplicationId(authToken, applicationId, applicationLineId)
          if (site) {
            pageContext.formValues = {
              'site-grid-reference': site.gridReference
            }
          }
        } catch (error) {
          LoggingService.logError(error, request)
          return reply.redirect(Constants.Routes.ERROR.path)
        }
      }

      return reply
        .view('siteGridReference', pageContext)
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

      // Get the Site for this application (if we have one)
      let site = await Site.getByApplicationId(authToken, applicationId, applicationLineId)

      if (!site) {
        // TODO: decide if we need isnew clause below

        // Create new Site
        site = new Site({
          name: request.payload['site-name'],
          gridReference: request.payload['site-grid-reference'],
          applicationId: applicationId,
          applicationLineId: applicationLineId
        })
      } else {
        // Update existing Site
        site.name = request.payload['site-name']
        site.gridReference = request.payload['site-grid-reference']
      }

      try {
        await site.save(authToken)
        return reply.redirect(Constants.Routes.TASK_LIST.path)
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
