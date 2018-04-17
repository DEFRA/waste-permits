'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const Account = require('../models/account.model')
const Utilities = require('../utilities/utilities')

module.exports = class CompanyNumberController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {application, account, payment} = await this.createApplicationContext(request, {application: true, account: true, payment: true})

    const redirectPath = await this.checkRouteAccess(application, payment)
    if (redirectPath) {
      return this.redirect({request, h, redirectPath})
    }

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      if (account) {
        pageContext.formValues = {
          'company-number': account.companyNumber
        }
      }
    }
    return this.showView({request, h, viewPath: 'companyNumber', pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const {authToken, application} = await this.createApplicationContext(request, {application: true})

      const companyNumber = Utilities.stripWhitespace(request.payload['company-number'])

      // See if there is an existing account with this company number. If not, create one.
      const account = (await Account.getByCompanyNumber(authToken, companyNumber)) || new Account()

      if (account.isNew()) {
        account.companyNumber = companyNumber
        await account.save(authToken, true)
      }

      // Update the Application with the Account (if it has changed)
      if (application && application.accountId !== account.id) {
        application.accountId = account.id
        await application.save(authToken)
      }

      return this.redirect({request, h, redirectPath: Constants.Routes.COMPANY_CHECK_TYPE.path})
    }
  }
}
