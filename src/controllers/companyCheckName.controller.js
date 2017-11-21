'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CompanyCheckNameValidator = require('../validators/companyCheckName.validator')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const CompanyLookupService = require('../services/companyLookup.service')
const Account = require('../models/account.model')
const CompanyDetails = require('../models/taskList/companyDetails.model')

module.exports = class CompanyCheckNameController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.COMPANY_CHECK_NAME, errors, CompanyCheckNameValidator)
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)

      let account = await Account.getByApplicationId(authToken, applicationId)
      if (!account) {
        return reply.redirect(Constants.Routes.TASK_LIST.path)
      }

      account.companyName = await CompanyLookupService.getCompanyName(account.companyNumber)

      if (request.payload) {
        // If we have Location name in the payload then display them in the form
        pageContext.formValues = request.payload
      } else {
        pageContext.formValues = {
          'company-number': account.companyNumber,
          'company-name': account.companyName,
          'use-business-trading-name': (account.tradingName !== undefined),
          'business-trading-name': account.tradingName
        }
      }

      pageContext.companyFound = account.companyName !== undefined

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
        let account = await Account.getByApplicationId(authToken, applicationId)
        if (!account) {
          return reply.redirect(Constants.Routes.TASK_LIST.path)
        }

        account.companyName = await CompanyLookupService.getCompanyName(account.companyNumber)
        if (account.companyName !== undefined) {
          account.tradingName = request.payload['business-trading-name']
          account.IsValidatedWithCompaniesHouse = true
          await account.save(authToken, false)

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
