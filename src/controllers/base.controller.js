'use strict'
const Config = require('../config/config')
const Constants = require('../constants')
const Routes = require('../routes')
const { allowedParameters } = require('../utilities/utilities')
const BaseTaskList = require('../models/taskList/base.taskList')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const RecoveryService = require('../services/recovery.service')
const { COOKIE_RESULT } = Constants

module.exports = class BaseController {
  constructor ({
    route,
    validator,
    cookieValidationRequired = true,
    applicationRequired = true,
    tasksCompleteRequired = false,
    submittedRequired = false
  }) {
    if (!route) {
      console.error(`Error - Unable to find Routes for: ${Object.getPrototypeOf(this).constructor.name}`)
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
    this.applicationRequired = applicationRequired
    this.tasksCompleteRequired = tasksCompleteRequired
  }

  createPageContext (h, errors, validator) {
    const { request } = h
    validator = validator || this.validator
    const pageContext = {
      skipLinkMessage: Constants.SKIP_LINK_MESSAGE,
      pageTitle: Constants.buildPageTitle(this.route.pageHeading),
      pageHeading: this.route.pageHeading,
      formAction: request.path,
      browserIsIE: request.plugins.scooter.family.toUpperCase() === 'IE'
    }
    pageContext.encodedPageTitle = encodeURI(pageContext.pageTitle)

    if (validator && errors && errors.details) {
      validator.addErrorsToPageContext(errors, pageContext)

      // Add the error prefix to the page title
      pageContext.pageTitle = `${Constants.PAGE_TITLE_ERROR_PREFIX} ${pageContext.pageTitle}`
    }

    return pageContext
  }

  async checkRouteAccess (context) {
    const { ALREADY_SUBMITTED, NOT_SUBMITTED, RECOVERY_FAILED, TASK_LIST } = Routes
    const { slug, application } = context
    if (!application) {
      return RECOVERY_FAILED.path
    }
    // If the application has been submitted
    if (this.submittedRequired) {
      if (!application.isSubmitted()) {
        return `${NOT_SUBMITTED.path}${slug ? '/' + slug : ''}`
      }
    } else {
      if (application.isSubmitted()) {
        return `${ALREADY_SUBMITTED.path}${slug ? '/' + slug : ''}`
      }
    }

    if (this.tasksCompleteRequired) {
      const TaskList = await BaseTaskList.getTaskListClass(context)
      const isComplete = await TaskList.isComplete(context)

      // If the task list is not complete then redirect back to it and show a validation error
      if (!isComplete) {
        return `${TASK_LIST.path}?showError=true`
      }
    }
  }

  redirect (params) {
    let {
      h,
      route = this.route.nextRoute,
      path = (typeof route === 'string' ? Routes[route].path : route.path),
      cookie,
      error
    } = allowedParameters(params, ['path', 'route', 'h', 'cookie', 'error'])

    if (!cookie) {
      cookie = h.request.state[Constants.DEFRA_COOKIE_KEY]
    }

    if (Config.isDevelopment && error) {
      path = path.includes('?') ? `${path}&error=${JSON.stringify(error)}` : `${path}?error=${JSON.stringify(error)}`
    }

    return h
      .redirect(path)
      .state(Constants.DEFRA_COOKIE_KEY, cookie, Constants.COOKIE_PATH)
  }

  showView (params) {
    let {
      h,
      pageContext,
      code = 200
    } = allowedParameters(params, ['h', 'pageContext', 'code'])

    return h
      .view(this.route.view, pageContext)
      .code(code)
      .state(Constants.DEFRA_COOKIE_KEY, h.request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
  }

  showViewFromRoute (params) {
    let {
      viewPropertyName,
      h,
      pageContext,
      code = 200
    } = allowedParameters(params, ['viewPropertyName', 'h', 'pageContext', 'code'])

    return h
      .view(this.route[viewPropertyName], pageContext)
      .code(code)
      .state(Constants.DEFRA_COOKIE_KEY, h.request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
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
        if (errors && errors.details) {
          return this.doGet(request, h, errors)
        } else {
          return this.doPost(request, h, errors)
        }
    }
  }

  async handler (request, h, errors) {
    const { START_AT_BEGINNING, TECHNICAL_PROBLEM, TIMEOUT } = Routes
    if (this.cookieValidationRequired) {
      // Validate the cookie
      const cookieValidationResult = await CookieService.validateCookie(request)
      let path

      switch (cookieValidationResult) {
        case COOKIE_RESULT.COOKIE_NOT_FOUND:
          path = START_AT_BEGINNING.path
          break
        case COOKIE_RESULT.COOKIE_EXPIRED:
          path = TIMEOUT.path
          break
        case COOKIE_RESULT.APPLICATION_NOT_FOUND:
          path = TECHNICAL_PROBLEM.path
          break
      }

      if (path) {
        return this.redirect({ h, path, error: { message: cookieValidationResult } })
      }
    }

    if (this.applicationRequired) {
      try {
        const context = await RecoveryService.createApplicationContext(h) || {}
        const path = await this.checkRouteAccess(context)
        if (path) {
          return this.redirect({ h, path })
        }
      } catch (error) {
        LoggingService.logError(error, request)
        return this.redirect({ h, route: TECHNICAL_PROBLEM, error })
      }
    }

    switch (this.route) {
      case Routes:
      case Routes.PAGE_NOT_FOUND:
        return this._handler(request, h, errors)
      default:
        try {
          const response = await this._handler(request, h, errors)
          return response
        } catch (error) {
          LoggingService.logError(error, request)
          return this.redirect({ h, route: TECHNICAL_PROBLEM, error })
        }
    }
  }
}
