'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const Application = require('../models/application.model')

module.exports = class PermitCategoryController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    const application = await Application.getById(authToken, applicationId)

    if (application.isSubmitted()) {
      return this.redirect(request, reply, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    pageContext.formValues = request.payload

    return this.showView(request, reply, 'permitCategory', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.details) {
      return this.doGet(request, reply, errors)
    } else {
      return this.redirect(request, reply, Constants.Routes.PERMIT_SELECT.path)
    }
  }
}
