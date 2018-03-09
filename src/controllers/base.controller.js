'use strict'

const Constants = require('../constants')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const {COOKIE_RESULT} = require('../constants')
const Application = require('../models/application.model')

module.exports = class BaseController {
  constructor (route, validator, cookieValidationRequired = true) {
    if (!route) {
      console.error(`Error - Unable to find Constants.Routes for: ${Object.getPrototypeOf(this).constructor.name}`)
    }
    this.route = route
    this.path = route.path
    if (validator) {
      this.validator = validator
    }
    this.failAction = async (...args) => {
      const failActionReply = await this.handler.apply(this, args)
      return failActionReply.takeover()
    }
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

    if (validator && errors && errors.details) {
      validator.addErrorsToPageContext(errors, pageContext)

      // Add the error prefix to the page title
      pageContext.pageTitle = `${Constants.PAGE_TITLE_ERROR_PREFIX} ${pageContext.pageTitle}`
    }

    return pageContext
  }

  async createApplicationContext (request, options = {application: false}) {
    const appContext = {
      authToken: CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN),
      applicationId: CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID),
      applicationLineId: CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_LINE_ID)
    }
    if (options.application) {
      appContext.application = await Application.getById(appContext.authToken, appContext.applicationId)
    }
    return appContext
  }

  redirect (request, reply, viewPath, cookie) {
    if (!cookie) {
      cookie = request.state[Constants.DEFRA_COOKIE_KEY]
    }
    return reply
      .redirect(viewPath)
      .state(Constants.DEFRA_COOKIE_KEY, cookie, Constants.COOKIE_PATH)
  }

  showView (request, reply, viewPath, pageContext, code = 200) {
    return reply
      .view(viewPath, pageContext)
      .code(code)
      .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
  }

  async _handler (request, reply, errors) {
    switch (request.method.toUpperCase()) {
      case 'GET':
        return this.doGet(request, reply, errors)
      case 'POST':
        if (this.validator && this.validator.customValidators) {
          // Apply custom validation if required
          errors = await this.validator.customValidate(request.payload, errors)
        }
        return this.doPost(request, reply, errors)
    }
  }

  async handler (request, reply, errors) {
    if (this.cookieValidationRequired) {
      // Validate the cookie
      const cookieValidationResult = await CookieService.validateCookie(request)

      if (cookieValidationResult === COOKIE_RESULT.COOKIE_NOT_FOUND) {
        return reply.redirect(Constants.Routes.ERROR.START_AT_BEGINNING.path)
      } else if (cookieValidationResult === COOKIE_RESULT.COOKIE_EXPIRED) {
        return reply.redirect(Constants.Routes.ERROR.TIMEOUT.path)
      } else if (cookieValidationResult === COOKIE_RESULT.APPLICATION_NOT_FOUND) {
        return reply.redirect(Constants.Routes.ERROR.TECHNICAL_PROBLEM.path)
      }
    }
    switch (this.route) {
      case Constants.Routes.ERROR:
      case Constants.Routes.PAGE_NOT_FOUND:
        return this._handler(request, reply, errors)
      default:
        try {
          const response = await this._handler(request, reply, errors)
          return response
        } catch (error) {
          LoggingService.logError(error, request)
          return reply.redirect(Constants.Routes.ERROR.TECHNICAL_PROBLEM.path)
        }
    }
  }
}
