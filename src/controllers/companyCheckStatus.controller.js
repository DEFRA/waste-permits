'use strict'

const Handlebars = require('handlebars')
const Constants = require('../constants')
const BaseController = require('./base.controller')
const CompanyLookupService = require('../services/companyLookup.service')

module.exports = class CompanyStatusController extends BaseController {
  constructor (...args) {
    const [route] = args
    super(...args)
    this.orginalPageHeading = route.pageHeading
  }

  async doGet (request, h, errors) {
    const {application, account, payment} = await this.createApplicationContext(request, {application: true, account: true, payment: true})

    const redirectPath = await this.checkRouteAccess(application, payment)
    if (redirectPath) {
      return this.redirect({request, h, redirectPath})
    }

    const company = await CompanyLookupService.getCompany(account.companyNumber)

    if (!company) {
      return this.redirect({request, h, redirectPath: Constants.Routes.COMPANY_CHECK_NAME.path})
    }

    let companyStatus

    if (company.status && !company.isActive) {
      companyStatus = Constants.Company.Status[company.status]
    } else {
      const activeDirectors = await CompanyLookupService.getActiveDirectors(account.companyNumber)
      if (activeDirectors.length) {
        return this.redirect({request, h, redirectPath: Constants.Routes.COMPANY_CHECK_NAME.path})
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

    return this.showView({request, h, viewPath: 'companyCheckStatus', pageContext})
  }
}
