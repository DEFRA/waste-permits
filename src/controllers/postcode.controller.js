'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const PostcodeValidator = require('../validators/postcode.validator')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const SiteNameAndLocation = require('../models/taskList/siteNameAndLocation.model')

module.exports = class PostcodeController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.POSTCODE, errors, PostcodeValidator)
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      const applicationLineId = CookieService.getApplicationLineId(request)

      if (request.payload) {
        // If we have Address details in the payload then display them in the form
        pageContext.formValues = request.payload
      } else {
        const address = await SiteNameAndLocation.getAddress(request, authToken, applicationId, applicationLineId)
        if (address) {
          pageContext.formValues = {
            'postcode': address.postcode
          }
        }
      }
      return reply.view('postcode', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return PostcodeController.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      const applicationLineId = CookieService.getApplicationLineId(request)

      const address = {
        postcode: request.payload['postcode']
      }
      try {
        await SiteNameAndLocation.saveAddress(request, address,
          authToken, applicationId, applicationLineId)

        return reply.redirect(Constants.Routes.ADDRESS_SELECT.path)
      } catch (error) {
        LoggingService.logError(error, request)
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, PostcodeController)
  }
}
