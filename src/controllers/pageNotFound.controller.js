'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class PageNotFoundController extends BaseController {
  static async doGet (request, reply, errors) {
    const pageContext = BaseController.createPageContext(Constants.Routes.PAGE_NOT_FOUND, errors)

    pageContext.taskList = Constants.Routes.TASK_LIST
    pageContext.startOpenOrSaved = Constants.Routes.START_OR_OPEN_SAVED

    return reply.view('pageNotFound', pageContext)
  }

  static handler (request, reply, source, errors) {
    // TODO refactor this to use the CookieService.validateCookie method once the PR has been merged
    // if (!CookieService.validateCookie(request) {
    if (!request.server.methods.validateToken(request.state[Constants.COOKIE_KEY])) {
      // Re-direct to the start page if they don't have a valid cookie
       reply.redirect(Constants.Routes.START_OR_OPEN_SAVED.path)
    } else {
      return BaseController.handler(request, reply, errors, PageNotFoundController, false)
    }
  }
}
