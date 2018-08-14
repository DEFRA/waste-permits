'use strict'

const Routes = require('../../routes')
const BaseController = require('../base.controller')
const CookieService = require('../../services/cookie.service')
const RecoveryService = require('../../services/recovery.service')

module.exports = class PageNotFoundController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)

    const {application, applicationLine} = await RecoveryService.createApplicationContext(h, {application: true, applicationLine: true})

    pageContext.hasApplication = PageNotFoundController.hasApplication(application, applicationLine)
    pageContext.taskListRoute = Routes.TASK_LIST.path
    pageContext.startOpenOrSavedRoute = Routes.START_OR_OPEN_SAVED.path

    return this.showView({request, h, pageContext, code: 404})
  }

  static hasApplication (application, applicationLine) {
    // Refactored out into a helper to aid unit testing
    return application && applicationLine
  }

  handler (request, h, errors) {
    if (!CookieService.validateCookie(request)) {
      // Re-direct to the start page if they don't have a valid cookie
      return this.redirect({request, h, redirectPath: Routes.START_OR_OPEN_SAVED.path})
    } else {
      return super.handler(request, h, errors)
    }
  }
}
