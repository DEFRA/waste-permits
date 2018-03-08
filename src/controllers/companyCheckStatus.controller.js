'use strict'

const Handlebars = require('handlebars')
const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const CompanyLookupService = require('../services/companyLookup.service')
const Account = require('../models/account.model')
const Application = require('../models/application.model')

module.exports = class CompanyStatusController extends BaseController {
  constructor (...args) {
    const [route] = args
    super(...args)
    this.orginalPageHeading = route.pageHeading
  }

  async doGet (request, reply, errors) {
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    const application = await Application.getById(authToken, applicationId)

    if (application.isSubmitted()) {
      return this.redirect(request, reply, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    const account = await Account.getByApplicationId(authToken, applicationId)
    const company = await CompanyLookupService.getCompany(account.companyNumber)

    if (!company) {
      return this.redirect(request, reply, Constants.Routes.COMPANY_CHECK_NAME.path)
    }

    let companyStatus

    if (company.status && !company.isActive) {
      companyStatus = Constants.Company.Status[company.status]
    } else {
      const activeDirectors = await CompanyLookupService.getActiveDirectors(account.companyNumber)
      if (activeDirectors.length) {
        return this.redirect(request, reply, Constants.Routes.COMPANY_CHECK_NAME.path)
      } else {
        companyStatus = Constants.Company.Status.NO_DIRECTORS
      }
    }

    this.route.pageHeading = Handlebars.compile(this.orginalPageHeading)({
      companyStatus: companyStatus
    })
    const pageContext = this.createPageContext(errors)

    pageContext.companyNumber = account.companyNumber
    pageContext.companyName = company.name
    pageContext.companyStatus = companyStatus
    pageContext.enterCompanyNumberRoute = Constants.Routes.COMPANY_NUMBER.path

    return this.showView(request, reply, 'companyCheckStatus', pageContext)
  }
}
