'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CompanyCheckNameValidator = require('../validators/companyCheckName.validator')
const CookieService = require('../services/cookie.service')
const CompanyLookupService = require('../services/companyLookup.service')
const Application = require('../models/application.model')
const Account = require('../models/account.model')

module.exports = class CompanyCheckNameController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors, new CompanyCheckNameValidator())
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)

    const [application, account] = await Promise.all([
      Application.getById(authToken, applicationId),
      Account.getByApplicationId(authToken, applicationId)
    ])

    if (!application || !account) {
      return reply.redirect(Constants.Routes.TASK_LIST.path)
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

    return reply.view('companyCheckName', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)

      const [application, account] = await Promise.all([
        Application.getById(authToken, applicationId),
        Account.getByApplicationId(authToken, applicationId)
      ])

      if (application && account) {
        const company = await CompanyLookupService.getCompany(account.companyNumber)

        account.name = company.name
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
      return reply.redirect(Constants.Routes.DIRECTOR_DATE_OF_BIRTH.path)
    }
  }
}
