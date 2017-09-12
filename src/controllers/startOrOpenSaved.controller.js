'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const StartOrOpenSavedValidator = require('../validators/startOrOpenSaved.validator')

module.exports = class StartOrOpenSavedController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      // TODO use this once another PR has been merged to master
      const pageContext = BaseController.createPageContext(Constants.Routes.START_OR_OPEN_SAVED, errors, StartOrOpenSavedValidator)

      pageContext.cost = {
        lower: (Constants.PermitTypes.STANDARD_RULES.cost.lower).toLocaleString(),
        upper: (Constants.PermitTypes.STANDARD_RULES.cost.upper).toLocaleString()
      }

      pageContext.formValues = request.payload

      return reply
        .view('startOrOpenSaved', pageContext)
    } catch (error) {
      console.error(error)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return StartOrOpenSavedController.doGet(request, reply, errors)
    } else {
      // TODO persist the data here if required

      const cookie = await BaseController.generateCookie(reply)

      return reply
        .redirect(Constants.Routes.SITE.path)

        // Delete the existing session cookie (if there is one)
        .unstate(Constants.COOKIE_KEY, {path: '/'})

        // Add the new cookie
        .state(Constants.COOKIE_KEY, cookie, {path: '/'})
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, StartOrOpenSavedController, false)
  }
}
