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
  async doGet (request, reply, errors) {
    LoggingService.logDebug('companyNumber GET')
    const pageContext = this.createPageContext(errors, new CompanyNumberValidator())
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
  }

  async doPost (request, reply, errors) {
    LoggingService.logDebug('companyNumber POST')
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      const companyNumber = Utilities.stripWhitespace(request.payload['company-number'])

      LoggingService.logDebug('companyNumber Account.getByCompanyNumber')

      // See if there is an existing account with this company number. If not, create one.
      const account = (await Account.getByCompanyNumber(authToken, companyNumber)) || new Account()

      LoggingService.logDebug('companyNumber Account.getByCompanyNumber retrieved:', account)

      if (account.isNew()) {
        LoggingService.logDebug('companyNumber Account is new')

        account.companyNumber = companyNumber

        LoggingService.logDebug('companyNumber saving account:', account)

        await account.save(authToken, true)

        LoggingService.logDebug('companyNumber saved account:', account)
      }

      // Update the Application with the Account (if it has changed)
      LoggingService.logDebug('companyNumber getting Application by ID:', applicationId)
      const application = await Application.getById(authToken, applicationId)
      LoggingService.logDebug('companyNumber got Application:', application)
      if (application.accountId !== account.id) {
        LoggingService.logDebug('companyNumber saving Application:', application)
        application.accountId = account.id
        await application.save(authToken)
        LoggingService.logDebug('companyNumber saved Application:', application)
      }

      return reply.redirect(Constants.Routes.COMPANY_CHECK_STATUS.path)
    }
  }
}
