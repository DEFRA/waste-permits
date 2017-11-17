'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CompanyCheckNameValidator = require('../validators/companyCheckName.validator')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const CompanyLookupService = require('../services/companyLookup.service')
const Account = require('../models/account.model')

// const SiteNameAndLocation = require('../models/taskList/siteNameAndLocation.model')

module.exports = class CompanyCheckNameController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.COMPANY_CHECK_NAME, errors, CompanyCheckNameValidator)
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)

      let account = await Account.getByApplicationId(authToken, applicationId)
      if (!account) {
        // TODO apply this when the account has been created in Dynamics by the previous screen
        // LoggingService.logError(`Application ${applicationId} does not have an Account`, request)
        // return reply.redirect(Constants.Routes.ERROR.path)

        // TODO remove this when the account has been created in Dynamics by the previous screen
        account = new Account({
          id: undefined,
          companyNumber: '07395892',
          companyName: undefined,
          tradingName: undefined
        })
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

      try {
        let account = await Account.getByApplicationId(authToken, applicationId)

        if (!account) {
          // TODO apply this when the account has been created in Dynamics by the previous screen
          // LoggingService.logError(`Application ${applicationId} does not have an Account`, request)
          // return reply.redirect(Constants.Routes.ERROR.path)

          // TODO remove this when the account has been created in Dynamics by the previous screen
          account = new Account({
            id: undefined,
            companyNumber: '07395892',
            companyName: undefined,
            tradingName: undefined
          })
        }

        account.companyName = await CompanyLookupService.getCompanyName(account.companyNumber)
        account.tradingName = request.payload['business-trading-name']

        await account.save(authToken)

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
