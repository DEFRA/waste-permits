'use strict'

const Handlebars = require('handlebars')
const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const CompanyLookupService = require('../services/companyLookup.service')
const Account = require('../models/account.model')

module.exports = class CompanyStatusController extends BaseController {
  constructor (route) {
    super(route)
    this.orginalPageHeading = route.pageHeading
  }

  async doGet (request, reply, errors) {
    LoggingService.logDebug('companyCheckStatus GET')

    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)
    const account = await Account.getByApplicationId(authToken, applicationId)

    LoggingService.logDebug('companyCheckStatus CompanyLookupService.getCompany for #:', account.companyNumber)

    const company = await CompanyLookupService.getCompany(account.companyNumber)
    LoggingService.logDebug('companyCheckStatus got company:', company)

    if (!company || !company.status || company.isActive) {
      return reply.redirect(Constants.Routes.COMPANY_CHECK_NAME.path)
    }

    const companyStatus = Constants.CompanyStatus[company.status]

    this.route.pageHeading = Handlebars.compile(this.orginalPageHeading)({
      companyStatus: companyStatus
    })
    const pageContext = this.createPageContext(errors)

    pageContext.companyNumber = account.companyNumber
    pageContext.companyName = company.name
    pageContext.companyStatus = companyStatus
    pageContext.enterCompanyNumberRoute = Constants.Routes.COMPANY_NUMBER.path

    return reply
      .view('companyCheckStatus', pageContext)
  }
}
