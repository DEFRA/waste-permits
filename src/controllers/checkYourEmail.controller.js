'use strict'

const Constants = require('../constants')
const LoggingService = require('../services/logging.service')
const BaseController = require('./base.controller')
const CheckYourEmailValidator = require('../validators/checkYourEmail.validator')

module.exports = class CheckYourEmailController extends BaseController {
  async doGet (request, reply, errors) {
    try {
      const pageContext = this.createPageContext(errors, CheckYourEmailValidator)

      pageContext.formValues = request.payload
      return reply.view('checkYourEmail', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      // TODO persist the data here if required using the applicationId from the cookie

      return reply.redirect(Constants.Routes.CONTACT.path)
    }
  }
}
