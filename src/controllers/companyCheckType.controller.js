'use strict'

const Handlebars = require('handlebars')
const Constants = require('../constants')
const BaseController = require('./base.controller')
const CompanyLookupService = require('../services/companyLookup.service')

module.exports = class CompanyTypeController extends BaseController {
  constructor (...args) {
    const [route] = args
    super(...args)
    this.orginalPageHeading = route.pageHeading
  }

  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const {application, account} = await this.createApplicationContext(request, {application: true, account: true})

    if (application.isSubmitted()) {
      return this.redirect(request, reply, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    const company = await CompanyLookupService.getCompany(account.companyNumber)

    const companyType = company ? Constants.Company.Type[company.type] : undefined

    if (!companyType) {
      return this.redirect(request, reply, Constants.Routes.COMPANY_CHECK_STATUS.path)
    }

    this.route.pageHeading = Handlebars.compile(this.orginalPageHeading)({
      companyType: companyType
    })

    pageContext.companyNumber = account.companyNumber
    pageContext.companyName = company.name
    pageContext.companyType = companyType
    pageContext.enterCompanyNumberRoute = Constants.Routes.COMPANY_NUMBER.path

    return this.showView(request, reply, 'companyCheckType', pageContext)
  }
}
