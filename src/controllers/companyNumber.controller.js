'use strict'

const BaseController = require('./base.controller')
const Account = require('../models/account.model')
const Utilities = require('../utilities/utilities')
const RecoveryService = require('../services/recovery.service')

module.exports = class CompanyNumberController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    const { account } = await RecoveryService.createApplicationContext(h, { account: true })

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      if (account) {
        pageContext.formValues = {
          'company-number': account.companyNumber
        }
      }
    }
    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, { application: true })
      const { application } = context

      const companyNumber = Utilities.stripWhitespace(request.payload['company-number'])

      // See if there is an existing account with this company number. If not, create one.
      const account = (await Account.getByCompanyNumber(context, companyNumber)) || new Account()

      if (account.isNew()) {
        account.companyNumber = companyNumber
        account.organisationType = application.organisationType
        await account.save(context, true)
      }

      // Update the Application with the Account (if it has changed)
      if (application && application.permitHolderOrganisationId !== account.id) {
        application.permitHolderOrganisationId = account.id
        await application.save(context)
      }

      return this.redirect({ request, h, redirectPath: this.nextPath })
    }
  }
}
