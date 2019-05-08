'use strict'

const BaseController = require('./base.controller')
const Account = require('../persistence/entities/account.entity')
const Utilities = require('../utilities/utilities')
const RecoveryService = require('../services/recovery.service')

module.exports = class CompanyNumberController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const { account, charityDetail } = await RecoveryService.createApplicationContext(h, { account: true })

    if (charityDetail && charityDetail.charityPermitHolder) {
      pageContext.pageHeading = this.route.pageHeadingCharity
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
    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h, { account: true })
    const { application, account = {} } = context

    const companyNumber = Utilities.stripWhitespace(request.payload['company-number'])

    if (companyNumber !== account.companyNumber) {
      // See if there is an existing account with this company number. If not, create one.
      const account = (await Account.getByCompanyNumber(context, companyNumber)) || new Account()

      if (account.isNew()) {
        account.companyNumber = companyNumber
        account.organisationType = application.organisationType
        account.isDraft = true
        await account.save(context)
      }

      application.permitHolderOrganisationId = account.id
      await application.save(context)
    }

    return this.redirect({ h })
  }
}
