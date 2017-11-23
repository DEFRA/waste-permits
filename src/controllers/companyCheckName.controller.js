'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CompanyCheckNameValidator = require('../validators/companyCheckName.validator')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const CompanyLookupService = require('../services/companyLookup.service')
const Application = require('../models/application.model')
const Account = require('../models/account.model')
const CompanyDetails = require('../models/taskList/companyDetails.model')

module.exports = class CompanyCheckNameController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.COMPANY_CHECK_NAME, errors, CompanyCheckNameValidator)
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
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return CompanyCheckNameController.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      const applicationLineId = CookieService.getApplicationLineId(request)

      try {
        const [application, account] = await Promise.all([
          Application.getById(authToken, applicationId),
          Account.getByApplicationId(authToken, applicationId)
        ])

        if (application && account) {
          const company = await CompanyLookupService.getCompany(account.companyNumber)

          account.name = company.name
          // TODO save the company address to Dynamics
          // account.address = company.address
          account.IsValidatedWithCompaniesHouse = true
          await account.save(authToken, false)

          // The company trading name is only set if the corresponding checkbox is ticked
          if (request.payload['use-business-trading-name'] === 'on') {
            application.tradingName = request.payload['business-trading-name']
          } else {
            application.tradingName = undefined
          }
          await application.save(authToken)

          // This will need to move to later pages in the flow when they are developed,
          // but it lives here for now
          await CompanyDetails.updateCompleteness(authToken, applicationId, applicationLineId)
        }
        return reply.redirect(Constants.Routes.TASK_LIST.path)
      } catch (error) {
        LoggingService.logError(error, request)
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, CompanyCheckNameController)
  }
}
