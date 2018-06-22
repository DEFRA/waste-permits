'use strict'

const BaseController = require('./base.controller')
const CompanyLookupService = require('../services/companyLookup.service')
const RecoveryService = require('../services/recovery.service')

const Routes = require('../routes')
const {TRADING_NAME_USAGE} = require('../constants').Dynamics

module.exports = class CompanyCheckNameController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {application, account} = await RecoveryService.createApplicationContext(h, {application: true, account: true})

    if (!application || !account) {
      return this.redirect({request, h, redirectPath: Routes.TASK_LIST.path})
    }

    const company = await CompanyLookupService.getCompany(account.companyNumber)

    if (request.payload) {
      // If we have Location name in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'company-number': account.companyNumber,
        'use-business-trading-name': (application.tradingName !== undefined),
        'business-trading-name': application.tradingName
      }
    }

    if (company) {
      pageContext.companyName = company.name
      pageContext.companyAddress = company.address
    }
    pageContext.companyFound = company !== undefined

    pageContext.enterCompanyNumberRoute = Routes[this.route.companyRoute].path

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, {application: true, account: true})
      const {application, account} = context

      if (application && account) {
        const company = await CompanyLookupService.getCompany(account.companyNumber)

        account.accountName = company.name
        account.isValidatedWithCompaniesHouse = true

        await account.save(context, false)

        await account.confirm(context)

        // The company trading name is only set if the corresponding checkbox is ticked
        if (request.payload['use-business-trading-name'] === 'on') {
          application.tradingName = request.payload['business-trading-name']
          application.useTradingName = TRADING_NAME_USAGE.YES
        } else {
          application.tradingName = undefined
          application.useTradingName = TRADING_NAME_USAGE.NO
        }

        await application.save(context)
      }
      return this.redirect({request, h, redirectPath: this.nextPath})
    }
  }
}
