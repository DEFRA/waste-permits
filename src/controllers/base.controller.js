'use strict'
const Config = require('../config/config')
const Constants = require('../constants')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const RecoveryService = require('../services/recovery.service')
const {COOKIE_RESULT, Routes} = Constants

module.exports = class BaseController {
  constructor ({
    route,
    validator,
    cookieValidationRequired = true,
    applicationRequired = true,
    submittedRequired = false,
    paymentRequired = false
  }) {
    if (!route) {
      console.error(`Error - Unable to find Constants.Routes for: ${Object.getPrototypeOf(this).constructor.name}`)
    }

    this.route = route
    this.path = route.path

    if (route.nextRoute) {
      this.nextPath = Routes[route.nextRoute].path
    }

    if (validator) {
      this.validator = validator
    }

    this.orginalPageHeading = route.pageHeading

    this.failAction = async (...args) => {
      const failActionReply = await this.handler.apply(this, args)
      return failActionReply.takeover()
    }

    this.cookieValidationRequired = cookieValidationRequired
    this.submittedRequired = submittedRequired
    this.paymentRequired = paymentRequired
    this.applicationRequired = applicationRequired
  }

  createPageContext (errors, validator) {
    validator = validator || this.validator
    const pageContext = {
      skipLinkMessage: Constants.SKIP_LINK_MESSAGE,
      pageTitle: Constants.buildPageTitle(this.route.pageHeading),
      pageHeading: this.route.pageHeading,
      formAction: this.path
    }
    pageContext.encodedPageTitle = encodeURI(pageContext.pageTitle)

    if (validator && errors && errors.details) {
      validator.addErrorsToPageContext(errors, pageContext)

      // Add the error prefix to the page title
      pageContext.pageTitle = `${Constants.PAGE_TITLE_ERROR_PREFIX} ${pageContext.pageTitle}`
    }

    return pageContext
  }

  async checkRouteAccess (slug, application, payment) {
    const {ALREADY_SUBMITTED, NOT_SUBMITTED, NOT_PAID, RECOVERY_FAILED} = Constants.Routes
    if (!application) {
      return RECOVERY_FAILED.path
    }
    if (this.submittedRequired) {
      if (!application.isSubmitted()) {
        return NOT_SUBMITTED.path
      }
      if (this.paymentRequired) {
        if (!(application.isPaid() || (payment && payment.isPaid()))) {
          // The application needs to be paid for
          return NOT_PAID.path
        }
      }
    } else {
      // If the application has been submitted
      if (application.isSubmitted()) {
        if (!(application.isPaid() || (payment && payment.isPaid()))) {
          // The application needs to be paid for
          return NOT_PAID.path
        }
        if (this.route !== ALREADY_SUBMITTED) {
          return `${Constants.ALREADY_SUBMITTED_URL}${slug ? '/' + slug : ''}`
        }
      }
    }
  }

  redirect ({request, h, redirectPath, cookie, error}) {
    if (!cookie) {
      cookie = request.state[Constants.DEFRA_COOKIE_KEY]
    }
    if (Config.isDevelopment && error) {
      redirectPath = `${redirectPath}?error=${JSON.stringify(error)}`
    }
    return h
      .redirect(redirectPath)
      .state(Constants.DEFRA_COOKIE_KEY, cookie, Constants.COOKIE_PATH)
  }

  showView ({request, h, pageContext, code = 200}) {
    return h
      .view(this.route.view, pageContext)
      .code(code)
      .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
  }

  setCustomError (type, field, options = {}) {
    return {
      details: [{
        type,
        path: field.split('.'),
        options
      }]
    }
  }

  async _handler (request, h, errors) {
    switch (request.method.toUpperCase()) {
      case 'GET':
        return this.doGet(request, h, errors)
      case 'POST':
        if (this.validator && this.validator.customValidators) {
          // Apply custom validation if required
          errors = await this.validator.customValidate(request.payload, errors)
        }
        return this.doPost(request, h, errors)
    }
  }

  async handler (request, h, errors) {
    const {START_AT_BEGINNING, TECHNICAL_PROBLEM, TIMEOUT} = Constants.Routes
    if (this.cookieValidationRequired) {
      // Validate the cookie
      const cookieValidationResult = await CookieService.validateCookie(request)
      let redirectPath

      switch (cookieValidationResult) {
        case COOKIE_RESULT.COOKIE_NOT_FOUND:
          redirectPath = START_AT_BEGINNING.path
          break
        case COOKIE_RESULT.COOKIE_EXPIRED:
          redirectPath = TIMEOUT.path
          break
        case COOKIE_RESULT.APPLICATION_NOT_FOUND:
          redirectPath = TECHNICAL_PROBLEM.path
          break
      }

      if (redirectPath) {
        return this.redirect({request, h, redirectPath, error: {message: cookieValidationResult}})
      }
    }

    if (this.applicationRequired) {
      try {
        const {slug, application, payment} = await RecoveryService.createApplicationContext(h, {application: true, payment: true}) || {}
        const redirectPath = await this.checkRouteAccess(slug, application, payment)
        if (redirectPath) {
          return this.redirect({request, h, redirectPath})
        }
      } catch (error) {
        LoggingService.logError(error, request)
        return this.redirect({request, h, redirectPath: TECHNICAL_PROBLEM.path, error})
      }
    }

    switch (this.route) {
      case Constants.Routes:
      case Constants.Routes.PAGE_NOT_FOUND:
        return this._handler(request, h, errors)
      default:
        try {
          const response = await this._handler(request, h, errors)
          return response
        } catch (error) {
          LoggingService.logError(error, request)
          return this.redirect({request, h, redirectPath: TECHNICAL_PROBLEM.path, error})
        }
    }
  }
}
