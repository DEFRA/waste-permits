'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CompanyCheckNameValidator = require('../validators/companyCheckName.validator')
// const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const CompanyLookupService = require('../services/companyLookup.service')

// const SiteNameAndLocation = require('../models/taskList/siteNameAndLocation.model')

module.exports = class CompanyCheckNameController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.COMPANY_CHECK_NAME, errors, CompanyCheckNameValidator)
      // const authToken = CookieService.getAuthToken(request)
      // const applicationId = CookieService.getApplicationId(request)
      // const applicationLineId = CookieService.getApplicationLineId(request)

      // TODO get this from Dynamics?
      const companyNumber = '07395892'

      const companyName = await CompanyLookupService.getCompanyName(companyNumber)

      if (request.payload) {
        // If we have Company details in the payload then display them in the form
        pageContext.formValues = request.payload

        pageContext.formValues['company-number'] = companyNumber
        pageContext.formValues['company-name'] = companyName
      } else {
        pageContext.formValues = {
          // TODO look up values
          // 'site-grid-reference': await SiteNameAndLocation.getGridReference(request, authToken, applicationId, applicationLineId)
          'company-number': companyNumber,
          'company-name': companyName,
          'use-business-trading-name': false,
          'business-trading-name': 'All the Things!'
        }
      }

      pageContext.companyFound = companyName !== undefined

      // TODO make this a constant
      pageContext.enterCompanyNumberRoute = '/permit-holder/company/number'

      return reply.view('companyCheckName', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return CompanyCheckNameController.doGet(request, reply, errors)
    } else {
      // const authToken = CookieService.getAuthToken(request)
      // const applicationId = CookieService.getApplicationId(request)
      // const applicationLineId = CookieService.getApplicationLineId(request)

      try {
        // await SiteNameAndLocation.saveGridReference(request, request.payload['site-grid-reference'],
        //   authToken, applicationId, applicationLineId)

        return reply.redirect(Constants.Routes.TASK_LIST.path)
      } catch (error) {
        LoggingService.logError(error, request)
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, CompanyCheckNameController)
  }
}
