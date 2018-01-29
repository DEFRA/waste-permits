'use strict'

const BaseController = require('./base.controller')
const Application = require('../models/application.model')
const CookieService = require('../services/cookie.service')

module.exports = class ApplicationReceivedController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)
    const application = await Application.getById(authToken, applicationId)
    pageContext.applicationName = application.name
    return reply
      .view('applicationReceived', pageContext)
  }
}
