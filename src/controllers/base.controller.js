'use strict'

const Constants = require('../constants')
const CookieService = require('../services/cookie.service')

module.exports = class BaseController {
  constructor (route, cookieValidationRequired = true) {
    this.route = route
    this.path = route.path
    this.failAction = (...args) => this.handler.apply(this, args)
    this.cookieValidationRequired = cookieValidationRequired
  }

  createPageContext (errors, ValidatorSubClass) {
    const pageContext = {
      skipLinkMessage: Constants.SKIP_LINK_MESSAGE,
      pageTitle: Constants.buildPageTitle(this.route.pageHeading),
      pageHeading: this.route.pageHeading,
      formAction: this.path
    }

    if (errors && errors.data && errors.data.details) {
      new ValidatorSubClass().addErrorsToPageContext(errors, pageContext)

      // Add the error prefix to the page title
      pageContext.pageTitle = `${Constants.PAGE_TITLE_ERROR_PREFIX} ${pageContext.pageTitle}`
    }

    return pageContext
  }

  handler (request, reply, source, errors) {
    if (this.cookieValidationRequired) {
      // Validate the cookie
      if (!CookieService.validateCookie(request)) {
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }
    switch (request.method.toUpperCase()) {
      case 'GET': return this.doGet(request, reply, errors)
      case 'POST': return this.doPost(request, reply, errors)
    }
  }
}
