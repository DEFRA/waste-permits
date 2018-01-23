'use strict'

const Constants = require('../constants')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')

module.exports = class BaseController {
  constructor (route, validator, cookieValidationRequired = true) {
    this.route = route
    this.path = route.path
    if (validator) {
      this.validator = validator
    }
    this.failAction = (...args) => this.handler.apply(this, args)
    this.cookieValidationRequired = cookieValidationRequired
  }

  createPageContext (errors, validator) {
    validator = validator || this.validator
    const pageContext = {
      skipLinkMessage: Constants.SKIP_LINK_MESSAGE,
      pageTitle: Constants.buildPageTitle(this.route.pageHeading),
      pageHeading: this.route.pageHeading,
      formAction: this.path
    }

    if (validator && errors && errors.data && errors.data.details) {
      validator.addErrorsToPageContext(errors, pageContext)

      // Add the error prefix to the page title
      pageContext.pageTitle = `${Constants.PAGE_TITLE_ERROR_PREFIX} ${pageContext.pageTitle}`
    }

    return pageContext
  }

  async _handler (request, reply, errors) {
    switch (request.method.toUpperCase()) {
      case 'GET':
        await this.doGet(request, reply, errors)
        break
      case 'POST':
        if (this.validator) {
          // Apply custom validation if required
          errors = this.validator.customValidate(request.payload, errors)
        }
        await this.doPost(request, reply, errors)
        break
    }
  }

  async handler (request, reply, source, errors) {
    if (this.cookieValidationRequired) {
      // Validate the cookie
      if (!CookieService.validateCookie(request)) {
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }
    switch (this.route) {
      case Constants.Routes.ERROR:
      case Constants.Routes.PAGE_NOT_FOUND:
        return this._handler(request, reply, errors)
      default:
        try {
          await this._handler(request, reply, errors)
        } catch (error) {
          LoggingService.logError(error, request)
          await reply.redirect(Constants.Routes.ERROR.path)
        }
    }
  }
}
