'use strict'

const Constants = require('../constants')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const {COOKIE_RESULT} = require('../constants')
const Application = require('../models/application.model')
const ApplicationLine = require('../models/applicationLine.model')
const Account = require('../models/account.model')
const Contact = require('../models/contact.model')
const Payment = require('../models/payment.model')
const StandardRule = require('../models/standardRule.model')

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

  async createApplicationContext (request,
    options = {
      application: false,
      applicationLine: false,
      account: false,
      contact: false,
      payment: false,
      standardRule: false}) {
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    const applicationLineId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_LINE_ID)
    const standardRuleId = CookieService.get(request, Constants.COOKIE_KEY.STANDARD_RULE_ID)
    const standardRuleTypeId = CookieService.get(request, Constants.COOKIE_KEY.STANDARD_RULE_TYPE_ID)
    const permitHolderType = CookieService.get(request, Constants.COOKIE_KEY.PERMIT_HOLDER_TYPE)

    // Query in parallel for optional entities
    const [application, applicationLine, account, contact, payment, standardRule] = await Promise.all([
      options.application ? Application.getById(authToken, applicationId) : Promise.resolve(undefined),
      options.applicationLine ? ApplicationLine.getById(authToken, applicationLineId) : Promise.resolve(undefined),
      options.account ? Account.getByApplicationId(authToken, applicationId) : Promise.resolve(undefined),
      options.contact ? Contact.getByApplicationId(authToken, applicationId) : Promise.resolve(undefined),
      options.payment ? Payment.getBacsPaymentDetails(authToken, applicationLineId) : Promise.resolve(undefined),
      options.standardRule ? StandardRule.getByApplicationLineId(authToken, applicationLineId) : Promise.resolve(undefined)
    ])

    return {
      authToken,
      applicationId,
      applicationLineId,
      application,
      applicationLine,
      account,
      contact,
      payment,
      standardRule,
      standardRuleId,
      standardRuleTypeId,
      permitHolderType
    }
  }

  async checkRouteAccess (application, payment) {
    // If the application has been submitted
    if (application.isSubmitted()) {
      if (application.isPaid() || (payment && payment.isPaid())) {
        // The application has already been paid for
        return Constants.Routes.ERROR.ALREADY_SUBMITTED.path
      } else {
        // The application needs to be paid for
        return Constants.Routes.ERROR.NOT_PAID.path
      }
    }
  }

  redirect (request, h, viewPath, cookie) {
    if (!cookie) {
      cookie = request.state[Constants.DEFRA_COOKIE_KEY]
    }
    return h
      .redirect(viewPath)
      .state(Constants.DEFRA_COOKIE_KEY, cookie, Constants.COOKIE_PATH)
  }

  showView (request, h, viewPath, pageContext, code = 200) {
    return h
      .view(viewPath, pageContext)
      .code(code)
      .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
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
    if (this.cookieValidationRequired) {
      // Validate the cookie
      const cookieValidationResult = await CookieService.validateCookie(request)

      if (cookieValidationResult === COOKIE_RESULT.COOKIE_NOT_FOUND) {
        return h.redirect(Constants.Routes.ERROR.START_AT_BEGINNING.path)
      } else if (cookieValidationResult === COOKIE_RESULT.COOKIE_EXPIRED) {
        return h.redirect(Constants.Routes.ERROR.TIMEOUT.path)
      } else if (cookieValidationResult === COOKIE_RESULT.APPLICATION_NOT_FOUND) {
        return h.redirect(Constants.Routes.ERROR.TECHNICAL_PROBLEM.path)
      }
    }
    switch (this.route) {
      case Constants.Routes.ERROR:
      case Constants.Routes.PAGE_NOT_FOUND:
        return this._handler(request, h, errors)
      default:
        try {
          const response = await this._handler(request, h, errors)
          return response
        } catch (error) {
          LoggingService.logError(error, request)
          return h.redirect(Constants.Routes.ERROR.TECHNICAL_PROBLEM.path)
        }
    }
  }
}
