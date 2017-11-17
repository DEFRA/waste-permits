'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const DirectorDateOfBirthValidator = require('../validators/directorDateOfBirth.validator')
// const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
// const SiteNameAndLocation = require('../models/taskList/siteNameAndLocation.model')

module.exports = class DirectorDateOfBirthController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.DIRECTOR_DATE_OF_BIRTH, errors, DirectorDateOfBirthValidator)
      // const authToken = CookieService.getAuthToken(request)
      // const applicationId = CookieService.getApplicationId(request)
      // const applicationLineId = CookieService.getApplicationLineId(request)

      // if (request.payload) {
      //   // If we have Location name in the payload then display them in the form
      //   pageContext.formValues = request.payload
      // } else {
      //   pageContext.formValues = {
      //     'site-name': await SiteNameAndLocation.getSiteName(request, authToken, applicationId, applicationLineId)
      //   }
      // }

      return reply.view('directorDateOfBirth', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return DirectorDateOfBirthController.doGet(request, reply, errors)
    } else {
      // const authToken = CookieService.getAuthToken(request)
      // const applicationId = CookieService.getApplicationId(request)
      // const applicationLineId = CookieService.getApplicationLineId(request)

      try {
        // await SiteNameAndLocation.saveSiteName(request, request.payload['site-name'],
        //   authToken, applicationId, applicationLineId)

        // TODO confirm next page
        return reply.redirect(Constants.Routes.TASK_LIST.path)
      } catch (error) {
        LoggingService.logError(error, request)
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, DirectorDateOfBirthController)
  }
}
