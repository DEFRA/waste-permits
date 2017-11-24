'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const DeclareOffencesValidator = require('../validators/declareOffences.validator')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const Application = require('../models/application.model')

module.exports = class DeclareOffencesController extends BaseController {
  async doGet (request, reply, errors) {
    try {
      const pageContext = this.createPageContext(errors, DeclareOffencesValidator)
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)

      if (request.payload) {
        pageContext.formValues = request.payload
      } else {
        const application = await Application.getById(authToken, applicationId)
        if (application) {
          pageContext.formValues = {
            'relevant-offences-details': application.relevantOffencesDetails,
            'offences': application.relevantOffences ? 'yes' : (application.relevantOffences === false ? 'no' : '')
          }
        } else {
          pageContext.formValues = {}
        }
      }
      pageContext.offencesDeclared = (pageContext.formValues.offences === 'yes')
      pageContext.noOffencesDeclared = (pageContext.formValues.offences === 'no')

      switch (this.route) {
        case Constants.Routes.COMPANY_DECLARE_OFFENCES:
          pageContext.operatorTypeIsLimitedCompany = true
          break
        default:
          throw new Error(`Unexpected route (${this.route.path}) for declareOffences.controller`)
      }

      pageContext.relevantOffencesDetailsMaxLength = DeclareOffencesValidator.getOfficeDetailsMaxLength().toLocaleString()

      pageContext.completeLaterRoute = Constants.Routes.TASK_LIST.path

      return reply.view('declareOffences', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)

      try {
        const application = await Application.getById(authToken, applicationId)
        application.relevantOffences = request.payload.offences === 'yes'
        application.relevantOffencesDetails = application.relevantOffences ? request.payload['relevant-offences-details'] : undefined
        await application.save(authToken)
        return reply.redirect(Constants.Routes.COMPANY_DECLARE_BANKRUPTCY.path)
      } catch (error) {
        LoggingService.logError(error, request)
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }
  }
}
