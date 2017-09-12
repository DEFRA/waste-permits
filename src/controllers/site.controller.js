'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const SiteValidator = require('../validators/site.validator')

module.exports = class SiteController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.SITE, errors, SiteValidator)

      pageContext.formValues = request.payload

      return reply.view('site', pageContext)
    } catch (error) {
      console.error(error)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return SiteController.doGet(request, reply, errors)
    } else {
      // TODO persist the data here if required
      // const applicationId = request.state[Constants.COOKIE_KEY].applicationId

      return reply.redirect(Constants.Routes.CONTACT.path)
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, SiteController)
  }
}
