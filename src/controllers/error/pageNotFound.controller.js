'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const CookieService = require('../../../src/services/cookie.service')

module.exports = class PageNotFoundController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)

    pageContext.taskList = Constants.Routes.TASK_LIST
    pageContext.startOpenOrSaved = Constants.Routes.START_OR_OPEN_SAVED

    return reply.view('error/pageNotFound', pageContext).code(404)
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
