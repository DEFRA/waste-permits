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
    return BaseController.handler(request, reply, errors, PageNotFoundController, false)
  }
}
