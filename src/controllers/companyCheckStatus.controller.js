'use strict'

const Handlebars = require('handlebars')
const { Status } = require('../constants').Company
const Routes = require('../routes')
const { COMPANY_CHECK_STATUS, LLP_COMPANY_CHECK_STATUS } = require('../routes')
const BaseController = require('./base.controller')
const CompanyLookupService = require('../services/companyLookup.service')
const RecoveryService = require('../services/recovery.service')

module.exports = class CompanyStatusController extends BaseController {
  async doGet (request, h, errors) {
    const { account } = await RecoveryService.createApplicationContext(h, { account: true })

    const company = await CompanyLookupService.getCompany(account.companyNumber)

    if (!company) {
      return this.redirect({ h, route: this.route.companyRoute })
    }

    let companyStatus

    if (company.status && !company.isActive) {
      companyStatus = Status[company.status]
    } else {
      let active
      switch (this.route.path) {
        case COMPANY_CHECK_STATUS.path:
          active = await CompanyLookupService.getActiveDirectors(account.companyNumber)
          break
        case LLP_COMPANY_CHECK_STATUS.path:
          active = await CompanyLookupService.getActiveDesignatedMembers(account.companyNumber)
          break
      }

      if (active.length) {
        return this.redirect({ h })
      } else {
        switch (this.route.path) {
          case COMPANY_CHECK_STATUS.path:
            companyStatus = Status.NO_DIRECTORS
            break
          case LLP_COMPANY_CHECK_STATUS.path:
            companyStatus = Status.NO_DESIGNATED_MEMBERS
            break
        }
      }
    }

    this.route.pageHeading = Handlebars.compile(this.orginalPageHeading)({
      companyStatus: companyStatus
    })
    const pageContext = this.createPageContext(h, errors)

    pageContext.companyNumber = account.companyNumber
    pageContext.companyName = company.name
    pageContext.companyStatus = companyStatus
    pageContext.enterCompanyNumberRoute = Routes[this.route.companyRoute].path

    return this.showView({ h, pageContext })
  }
}
