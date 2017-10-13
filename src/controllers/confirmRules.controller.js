'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
// const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')

module.exports = class ConfirmRulesController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.CONFIRM_RULES, errors)
      // const authToken = CookieService.getAuthToken(request)
      // const applicationId = CookieService.getApplicationId(request)

      if (request.payload) {
        // If we have Site details in the payload then display them in the form
        pageContext.formValues = request.payload
      } else {
        // Get the Site for this application (if we have one)
        try {
          // TODO find out if the button has already been clicked

          // const site = await Site.getByApplicationId(authToken, applicationId)
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
        .view('confirmRules', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return ConfirmRulesController.doGet(request, reply, errors)
    } else {
      // const authToken = CookieService.getAuthToken(request)
      // const applicationId = CookieService.getApplicationId(request)

      // TODO
      // Get the Site for this application (if we have one)
      // let site = await Site.getByApplicationId(authToken, applicationId)

      // if (!site) {
      //   // Create new Site
      //   site = new Site({
      //     name: request.payload['site-name'],
      //     applicationId: applicationId
      //   })
      // } else {
      //   // Update existing Site
      //   site.name = request.payload['site-name']
      // }

      try {
        // TODO save?
        // await site.save(authToken)
        return reply.redirect(Constants.Routes.CONFIRM_RULES.path)

        // TODO go back to Task list on 2nd post
        // return reply.redirect(Constants.Routes.TASK_LIST.path)
      } catch (error) {
        LoggingService.logError(error, request)
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, ConfirmRulesController)
  }
}
