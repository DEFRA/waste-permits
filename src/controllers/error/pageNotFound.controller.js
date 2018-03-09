'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const CookieService = require('../../services/cookie.service')

module.exports = class PageNotFoundController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)

    const {application, applicationLine} = await this.createApplicationContext(request, {application: true, applicationLine: true})

    pageContext.hasApplication = PageNotFoundController.hasApplication(application, applicationLine)
    pageContext.taskListRoute = Constants.Routes.TASK_LIST.path
    pageContext.startOpenOrSavedRoute = Constants.Routes.START_OR_OPEN_SAVED.path

    return this.showView(request, reply, 'error/pageNotFound', pageContext, 404)
  }

  static hasApplication (application, applicationLine) {
    // Refactored out into a helper to aid unit testing
    return application && applicationLine
  }

  handler (request, reply, errors) {
    if (!CookieService.validateCookie(request)) {
      // Re-direct to the start page if they don't have a valid cookie
      return this.redirect(request, reply, Constants.Routes.START_OR_OPEN_SAVED.path)
    } else {
      return super.handler(request, reply, errors)
    }
  }
}
