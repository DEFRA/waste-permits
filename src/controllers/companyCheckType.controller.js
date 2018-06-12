'use strict'

const Handlebars = require('handlebars')
const Constants = require('../constants')
const BaseController = require('./base.controller')
const CompanyLookupService = require('../services/companyLookup.service')
const RecoveryService = require('../services/recovery.service')

module.exports = class CompanyTypeController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {account} = await RecoveryService.createApplicationContext(h, {account: true})

    const company = await CompanyLookupService.getCompany(account.companyNumber)

    const companyType = company ? Constants.Company.Type[company.type] : undefined

    if (!companyType) {
      return this.redirect({request, h, redirectPath: Constants.Routes.PERMIT_HOLDER.COMPANY_CHECK_STATUS.path})
    }

    this.route.pageHeading = Handlebars.compile(this.orginalPageHeading)({
      companyType: companyType
    })

    pageContext.companyNumber = account.companyNumber
    pageContext.companyName = company.name
    pageContext.companyType = companyType
    pageContext.enterCompanyNumberRoute = Constants.Routes.PERMIT_HOLDER.COMPANY_NUMBER.path

    return this.showView({request, h, pageContext})
  }
}
