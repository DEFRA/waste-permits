'use strict'

const Constants = require('../constants')
const Application = require('../models/application.model')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')

module.exports = class CheckBeforeSendingController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()
    return reply
      .view('checkBeforeSending', pageContext)
  }

  async doPost (request, reply) {
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)
    const application = await Application.getById(authToken, applicationId)
    application.declaration = true
    await application.save(authToken)
    return reply.redirect(Constants.Routes.APPLICATION_RECEIVED.path)
  }
}
