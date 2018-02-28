'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
// const CookieService = require('../services/cookie.service')
// const Application = require('../models/application.model')

module.exports = class PermitCategoryController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    // const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    // const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    // const application = await Application.getById(authToken, applicationId)

    // if (application.isSubmitted()) {
    //   return reply
    //     .redirect(Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    //     .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
    // }

    pageContext.formValues = request.payload

    return reply
      .view('permitCategory', pageContext)
      .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
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
