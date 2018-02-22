'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const CookieService = require('../../services/cookie.service')
const Application = require('../../models/application.model')

module.exports = class AlreadySubmittedController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    const application = await Application.getById(authToken, applicationId)

    pageContext.startOpenOrSavedRoute = Constants.Routes.START_OR_OPEN_SAVED.path
    pageContext.applicationRef = application.applicationNumber

    return reply
      .view('error/alreadySubmitted', pageContext)
      .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
  }
}
