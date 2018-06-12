'use strict'

const Handlebars = require('handlebars')
const Constants = require('../constants')
const BaseController = require('./base.controller')
const CompanyLookupService = require('../services/companyLookup.service')
const RecoveryService = require('../services/recovery.service')

module.exports = class CompanyStatusController extends BaseController {
  async doGet (request, h, errors) {
    const {account} = await RecoveryService.createApplicationContext(h, {account: true})

    const company = await CompanyLookupService.getCompany(account.companyNumber)

    if (!company) {
      return this.redirect({request, h, redirectPath: Constants.Routes.PERMIT_HOLDER.COMPANY_CHECK_NAME.path})
    }

    let companyStatus

    if (company.status && !company.isActive) {
      companyStatus = Constants.Company.Status[company.status]
    } else {
      const activeDirectors = await CompanyLookupService.getActiveDirectors(account.companyNumber)
      if (activeDirectors.length) {
        return this.redirect({request, h, redirectPath: Constants.Routes.PERMIT_HOLDER.COMPANY_CHECK_NAME.path})
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
    pageContext.enterCompanyNumberRoute = Constants.Routes.PERMIT_HOLDER.COMPANY_NUMBER.path

    return this.showView({request, h, pageContext})
  }
}
