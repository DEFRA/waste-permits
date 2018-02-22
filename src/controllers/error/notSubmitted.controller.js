'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
// const CookieService = require('../../services/cookie.service')
// const Application = require('../../models/application.model')
// const ApplicationLine = require('../../models/applicationLine.model')

module.exports = class NotSubmittedController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    // const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    // const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    // const application = applicationId ? await Application.getById(authToken, applicationId) : undefined
    // const applicationLineId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_LINE_ID)
    // const applicationLine = applicationLineId ? await ApplicationLine.getById(authToken, applicationLineId) : undefined

    pageContext.checkYourAnswersRoute = Constants.Routes.CHECK_BEFORE_SENDING.path

    return reply
      .view('error/notSubmitted', pageContext)
      .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
  }
}
