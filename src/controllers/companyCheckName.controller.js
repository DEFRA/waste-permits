'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CompanyLookupService = require('../services/companyLookup.service')

module.exports = class CompanyCheckNameController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const {application, account} = await this.createApplicationContext(request, {application: true, account: true})

    if (!application || !account) {
      return this.redirect(request, reply, Constants.Routes.TASK_LIST.path)
    }

    if (application.isSubmitted()) {
      return this.redirect(request, reply, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
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

    pageContext.enterCompanyNumberRoute = Constants.Routes.COMPANY_NUMBER.path

    return this.showView(request, reply, 'companyCheckName', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.details) {
      return this.doGet(request, reply, errors)
    } else {
      const {authToken, application, account} = await this.createApplicationContext(request, {application: true, account: true})

      if (application && account) {
        const company = await CompanyLookupService.getCompany(account.companyNumber)

        account.accountName = company.name
        account.isValidatedWithCompaniesHouse = true

        await account.save(authToken, false)

        await account.confirm(authToken)

        // The company trading name is only set if the corresponding checkbox is ticked
        if (request.payload['use-business-trading-name'] === 'on') {
          application.tradingName = request.payload['business-trading-name']
        } else {
          application.tradingName = undefined
        }

        await application.save(authToken)
      }
      return this.redirect(request, reply, Constants.Routes.DIRECTOR_DATE_OF_BIRTH.path)
    }
  }
}
