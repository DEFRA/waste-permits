'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CompanyNumberValidator = require('../validators/companyNumber.validator')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const Application = require('../models/application.model')
const Account = require('../models/account.model')
const Utilities = require('../utilities/utilities')

module.exports = class CompanyNumberController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.COMPANY_NUMBER, errors, CompanyNumberValidator)
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)

      if (request.payload) {
        pageContext.formValues = request.payload
      } else {
        const account = await Account.getByApplicationId(authToken, applicationId)
        if (account) {
          pageContext.formValues = {
            'company-number': account.companyNumber
          }
        }
      }
      return reply
        .view('companyNumber', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return CompanyNumberController.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      try {
        const account = (await Account.getByApplicationId(authToken, applicationId)) || new Account()
        const application = await Application.getById(authToken, applicationId)
        const companyNumber = Utilities.stripWhitespace(request.payload['company-number'])
        const isDraft = (companyNumber !== account.companyNumber)

        account.companyNumber = companyNumber
        await account.save(authToken, isDraft)
        if (!application.accountId) {
          application.accountId = account.id
          await application.save(authToken)
        }
        return reply.redirect(Constants.Routes.COMPANY_CHECK_NAME.path)
      } catch (error) {
        LoggingService.logError(error, request)
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, CompanyNumberController)
  }
}
