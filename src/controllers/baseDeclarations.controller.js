'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const Application = require('../models/application.model')

module.exports = class DeclareOffencesController extends BaseController {
  constructor (route, cookieValidationRequired, nextRoute, validator) {
    super(route, cookieValidationRequired)
    this.validator = validator
    this.nextPath = nextRoute.path
  }

  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors, this.validator)

    switch (this.route) {
      case Constants.Routes.COMPANY_DECLARE_OFFENCES:
      case Constants.Routes.COMPANY_DECLARE_BANKRUPTCY:
        pageContext.operatorTypeIsLimitedCompany = true
        break
      default:
        throw new Error(`Unexpected route (${this.route.path})`)
    }

    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const application = await Application.getById(authToken, applicationId)
      pageContext.formValues = this.getFormData(application, pageContext)
    }

    pageContext.declared = (pageContext.formValues.declared === 'yes')
    pageContext.noneDeclared = (pageContext.formValues.declared === 'no')
    pageContext.declaredDetailsMaxLength = this.validator.getDeclaredDetailsMaxLength().toLocaleString()

    Object.assign(pageContext, this.getSpecificPageContext())

    return reply.view('declarations', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      const application = await Application.getById(authToken, applicationId)
      Object.assign(application, this.getRequestData(request))
      await application.save(authToken)
      return reply.redirect(this.nextPath)
    }
  }

  getFormData (data, declared, declarationDetails) {
    if (!data) {
      return {}
    }
    return {
      'declaration-details': data[declarationDetails],
      'declared': data[declared] ? 'yes' : (data[declared] === false ? 'no' : '')
    }
  }

  getRequestData (request, declared, declarationDetails) {
    const data = {}
    data[declared] = request.payload.declared === 'yes'
    data[declarationDetails] = data[declared] ? request.payload['declaration-details'] : undefined
    return data
  }
}
