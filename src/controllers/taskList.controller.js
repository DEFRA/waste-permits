'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const StandardRule = require('../models/standardRule.model')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const TaskListValidator = require('../validators/taskList.validator')
const Permit = require('../models/permit.model')

module.exports = class TaskListController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      // For now we are only getting the SR2015 No 18 permit
      const chosenPermit = 'SR2015 No 18'

      const pageContext = BaseController.createPageContext(Constants.Routes.TASK_LIST, errors, TaskListValidator)
      const applicationId = CookieService.getApplicationId(request)
      const authToken = CookieService.getAuthToken(request)

      pageContext.formValues = request.payload

      pageContext.chosenPermit = chosenPermit
      pageContext.standardRule = await StandardRule.getByCode(authToken, pageContext.chosenPermit)

      const permit = await Permit.getById(applicationId)
      pageContext.taskList = permit[chosenPermit]
      pageContext.permitCategoryRoute = Constants.Routes.PERMIT_CATEGORY.path

      return reply
        .view('taskList', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    // Not implemented yet
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, TaskListController)
  }
}
