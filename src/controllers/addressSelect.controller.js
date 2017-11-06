'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const AddressSelectValidator = require('../validators/addressSelect.validator')
// const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
// const Site = require('../models/location.model')

module.exports = class AddressSelectController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.ADDRESS_SELECT, errors, AddressSelectValidator)
      // const authToken = CookieService.getAuthToken(request)
      // const applicationId = CookieService.getApplicationId(request)
      // const applicationLineId = CookieService.getApplicationLineId(request)

      console.log('PAYLOAD:', request.payload)

      if (request.payload) {
        // If we have Site details in the payload then display them in the form
        pageContext.formValues = request.payload
      } else {
        // TODO
        // Look up the addresses for this postcode

        // Get the Site for this application (if we have one)
        try {
          // const site = await Site.getByApplicationId(authToken, applicationId, applicationLineId)
          // if (site) {
          //   pageContext.formValues = {
          //     'site-name': site.name
          //   }
          // }
        } catch (error) {
          LoggingService.logError(error, request)
          return reply.redirect(Constants.Routes.ERROR.path)
        }
      }

      return reply
        .view('addressSelect', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return AddressSelectController.doGet(request, reply, errors)
    } else {
      // const authToken = CookieService.getAuthToken(request)
      // const applicationId = CookieService.getApplicationId(request)
      // const applicationLineId = CookieService.getApplicationLineId(request)

      // Get the Site for this application (if we have one)
      // let site = await Site.getByApplicationId(authToken, applicationId, applicationLineId)
      //
      // if (!site) {
      //   // Create new Site
      //   site = new Site({
      //     name: request.payload['site-name'],
      //     applicationId: applicationId,
      //     applicationLineId: applicationLineId
      //   })
      // } else {
      //   // Update existing Site
      //   site.name = request.payload['site-name']
      // }

      try {
        // await site.save(authToken)
        return reply.redirect(Constants.Routes.TASK_LIST.path)
      } catch (error) {
        LoggingService.logError(error, request)
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, AddressSelectController)
  }
}
