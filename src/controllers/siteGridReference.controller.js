'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const SiteGridReferenceValidator = require('../validators/siteGridReference.validator')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const Location = require('../models/location.model')
const LocationDetail = require('../models/locationDetail.model')

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
        try {
          // Get the Location for this application
          let location = await Location.getByApplicationId(authToken, applicationId, applicationLineId)

          // Get the LocationDetail for this application (if there is one)
          let locationDetail = await LocationDetail.getByLocationId(authToken, location.id)
          if (locationDetail) {
            pageContext.formValues = {
              'site-grid-reference': locationDetail.gridReference
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

      // Get the Location for this application
      let location = await Location.getByApplicationId(authToken, applicationId, applicationLineId)

      if (location) {
        // Get the LocationDetail for this application (if there is one)
        let locationDetail = await LocationDetail.getByLocationId(authToken, location.id)
        if (!locationDetail) {
          // Create new LocationDetail
          locationDetail = new LocationDetail({
            gridReference: request.payload['site-grid-reference'],
            locationId: location.id
          })
        } else {
          // Update existing LocationDetail
          locationDetail.gridReference = request.payload['site-grid-reference']
        }

        try {
          await locationDetail.save(authToken)
          return reply.redirect(Constants.Routes.TASK_LIST.path)
        } catch (error) {
          LoggingService.logError(error, request)
          return reply.redirect(Constants.Routes.ERROR.path)
        }
      }
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, SiteGridReferenceController)
  }
}
