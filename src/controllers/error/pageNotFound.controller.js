'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const CookieService = require('../../services/cookie.service')
const Application = require('../../models/application.model')
const ApplicationLine = require('../../models/applicationLine.model')

module.exports = class PageNotFoundController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    const application = applicationId ? await Application.getById(authToken, applicationId) : undefined
    const applicationLineId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_LINE_ID)
    const applicationLine = applicationLineId ? await ApplicationLine.getById(authToken, applicationLineId) : undefined

    pageContext.hasApplication = PageNotFoundController.hasApplication(application, applicationLine)
    pageContext.taskListRoute = Constants.Routes.TASK_LIST.path
    pageContext.startOpenOrSavedRoute = Constants.Routes.START_OR_OPEN_SAVED.path

    return reply
      .view('error/pageNotFound', pageContext).code(404)
      .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
  }

  static hasApplication (application, applicationLine) {
    return application && applicationLine
  }

  handler (request, reply, source, errors) {
    if (!CookieService.validateCookie(request)) {
      // Re-direct to the start page if they don't have a valid cookie
      reply.redirect(Constants.Routes.START_OR_OPEN_SAVED.path)
    } else {
      return super.handler(request, reply, source, errors)
    }
  }
}
