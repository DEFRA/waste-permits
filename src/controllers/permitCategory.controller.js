'use strict'

const Constants = require('../constants')
const LoggingService = require('../services/logging.service')
const BaseController = require('./base.controller')
const PermitCategoryValidator = require('../validators/permitCategory.validator')

module.exports = class PermitCategoryController extends BaseController {
  async doGet (request, reply, errors) {
    try {
      const pageContext = this.createPageContext(errors, PermitCategoryValidator)

      pageContext.formValues = request.payload
      return reply.view('permitCategory', pageContext)
    } catch (error) {
      LoggingService.logError(error)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      // TODO persist the data here if required using the applicationId from the cookie
      return reply.redirect(Constants.Routes.PERMIT_SELECT.path)
    }
  }
}
