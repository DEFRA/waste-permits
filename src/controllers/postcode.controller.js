'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const PostcodeValidator = require('../validators/postcode.validator')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const SiteNameAndLocation = require('../models/taskList/siteNameAndLocation.model')

module.exports = class PostcodeController extends BaseController {
  async doGet (request, reply, errors) {
    try {
      const pageContext = this.createPageContext(errors, PostcodeValidator)
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

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
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
}
