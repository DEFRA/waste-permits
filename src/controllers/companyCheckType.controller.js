'use strict'

const Handlebars = require('handlebars')
const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const CompanyLookupService = require('../services/companyLookup.service')
const Account = require('../models/account.model')

module.exports = class CompanyTypeController extends BaseController {
  constructor (...args) {
    const [route] = args
    super(...args)
    this.orginalPageHeading = route.pageHeading
  }

  async doGet (request, reply, errors) {
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    const account = await Account.getByApplicationId(authToken, applicationId)
    const company = await CompanyLookupService.getCompany(account.companyNumber)

    const companyType = company ? Constants.Company.Type[company.type] : undefined

    if (!companyType) {
      return reply.redirect(Constants.Routes.COMPANY_CHECK_STATUS.path)
    }

    this.route.pageHeading = Handlebars.compile(this.orginalPageHeading)({
      companyType: companyType
    })

    const pageContext = this.createPageContext(errors)

    pageContext.companyNumber = account.companyNumber
    pageContext.companyName = company.name
    pageContext.companyType = companyType
    pageContext.enterCompanyNumberRoute = Constants.Routes.COMPANY_NUMBER.path

    return reply
      .view('companyCheckType', pageContext)
  }
}
