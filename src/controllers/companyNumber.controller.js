'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const Application = require('../models/application.model')
const Account = require('../models/account.model')
const Utilities = require('../utilities/utilities')

module.exports = class CompanyNumberController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    const application = await Application.getById(authToken, applicationId)

    if (application.isSubmitted()) {
      return reply
        .redirect(Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
        .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
    }

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
      .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
      const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
      const companyNumber = Utilities.stripWhitespace(request.payload['company-number'])

      // See if there is an existing account with this company number. If not, create one.
      const account = (await Account.getByCompanyNumber(authToken, companyNumber)) || new Account()

      if (account.isNew()) {
        account.companyNumber = companyNumber
        await account.save(authToken, true)
      }

      // Update the Application with the Account (if it has changed)
      const application = await Application.getById(authToken, applicationId)
      if (application && application.accountId !== account.id) {
        application.accountId = account.id
        await application.save(authToken)
      }

      return reply
        .redirect(Constants.Routes.COMPANY_CHECK_TYPE.path)
        .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
    }
  }
}
