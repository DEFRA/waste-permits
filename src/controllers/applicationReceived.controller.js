'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const Application = require('../models/application.model')
const CookieService = require('../services/cookie.service')

module.exports = class ApplicationReceivedController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    const application = await Application.getById(authToken, applicationId)
    pageContext.applicationName = application.name
    return reply
      .view('applicationReceived', pageContext)
  }
}
