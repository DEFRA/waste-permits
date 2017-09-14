'use strict'

const Constants = require('../constants')
const ServerLoggingService = require('../services/serverLogging.service')
const BaseController = require('./base.controller')
const PermitCategoryValidator = require('../validators/permitCategory.validator')

module.exports = class PermitCategoryController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.PERMIT_CATEGORY, errors, PermitCategoryValidator)

      pageContext.formValues = request.payload
      return reply.view('permitCategory', pageContext)
    } catch (error) {
      ServerLoggingService.logError(error)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return PermitCategoryController.doGet(request, reply, errors)
    } else {
      // TODO persist the data here if required
      // const applicationId = request.state[Constants.COOKIE_KEY].applicationId

      return reply.redirect(Constants.Routes.CONTACT.path)
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, PermitCategoryController)
  }
}
