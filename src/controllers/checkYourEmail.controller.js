'use strict'

const Constants = require('../constants')
const LoggingService = require('../services/logging.service')
const BaseController = require('./base.controller')
const CheckYourEmailValidator = require('../validators/checkYourEmail.validator')

module.exports = class CheckYourEmailController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.CHECK_YOUR_EMAIL, errors, CheckYourEmailValidator)

      pageContext.formValues = request.payload
      return reply.view('checkYourEmail', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return CheckYourEmailController.doGet(request, reply, errors)
    } else {
      // TODO persist the data here if required
      // const applicationId = request.state[Constants.COOKIE_KEY].applicationId

      return reply.redirect(Constants.Routes.CONTACT.path)
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, CheckYourEmailController, false)
  }
}
