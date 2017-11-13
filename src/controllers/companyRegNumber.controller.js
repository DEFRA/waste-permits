'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const CompanyRegNumber = require('../models/companyRegNumber.model')

module.exports = class CompanyRegNumberController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.COMPANY_REGISTRATION_NUMBER, errors)

      return reply
        .view('companyRegNumber', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return CompanyRegNumberController.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationLineId = CookieService.getApplicationLineId(request)

      // Get the Company Registration Number for this application (if we have one)
      const companyRegNumber = new CompanyRegNumber({
        applicationLineId: applicationLineId
      })

      try {
        await companyRegNumber.save(authToken)
        return reply.redirect(Constants.Routes.TASK_LIST.path)
      } catch (error) {
        LoggingService.logError(error, request)
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, CompanyRegNumberController)
  }
}
