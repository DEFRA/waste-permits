'use strict'

const Handlebars = require('handlebars')
const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const CompanyLookupService = require('../services/companyLookup.service')
const Account = require('../models/account.model')

module.exports = class CompanyStatusController extends BaseController {
  static async doGet (request, reply, errors) {
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)
    try {
      const account = await Account.getByApplicationId(authToken, applicationId)

      const company = await CompanyLookupService.getCompany(account.companyNumber)
      if (!company || !company.status || company.isActive) {
        return reply.redirect(Constants.Routes.COMPANY_CHECK_NAME.path)
      }

      const route = Object.assign({}, Constants.Routes.COMPANY_CHECK_STATUS)
      const companyStatus = Constants.CompanyStatus[company.status]

      route.pageHeading = Handlebars.compile(route.pageHeading)({companyStatus: companyStatus})
      const pageContext = BaseController.createPageContext(route, errors)

      pageContext.companyNumber = account.companyNumber
      pageContext.companyName = company.name
      pageContext.companyStatus = companyStatus
      pageContext.enterCompanyNumberRoute = Constants.Routes.COMPANY_NUMBER.path

      return reply
        .view('companyCheckStatus', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, CompanyStatusController)
  }
}
