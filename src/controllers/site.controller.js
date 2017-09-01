'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const SiteValidator = require('../validators/site.validator')

module.exports = class SiteController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext('What\'s the site name?', errors, SiteValidator)

      pageContext.formValues = request.payload

      return reply
        .view('site', pageContext)
        .state(Constants.COOKIE_KEY, request.state[Constants.COOKIE_KEY])
    } catch (error) {
      console.error(error)
      return reply.redirect(Constants.Routes.ERROR)
    }
  }

  static async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return SiteController.doGet(request, reply, errors)
    } else {
      // TODO persist the data here if required

      return reply.redirect(Constants.Routes.CONTACT)
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, SiteController)
  }
}
