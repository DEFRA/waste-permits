'use strict'

const Constants = require('../constants')
const Application = require('../models/application.model')
const ApplicationLine = require('../models/applicationLine.model')
const BaseController = require('./base.controller')
const PermitCheck = require('../models/checkYourAnswers/permit.check')
const SiteCheck = require('../models/checkYourAnswers/site.check')
const TechnicalCompetenceCheck = require('../models/checkYourAnswers/technicalCompetence.check')
const ContactCheck = require('../models/checkYourAnswers/contact.check')
const PermitHolderCheck = require('../models/checkYourAnswers/permitHolder.check')
const ConfidentialityCheck = require('../models/checkYourAnswers/confidentiality.check')
const InvoiceCheck = require('../models/checkYourAnswers/invoice.check')
const CookieService = require('../services/cookie.service')

module.exports = class CheckBeforeSendingController extends BaseController {
  constructor (...args) {
    super(...args)
    // List of Checks.
    // Please note order is display order.
    this._checks = [
      PermitCheck,
      ContactCheck,
      PermitHolderCheck,
      SiteCheck,
      TechnicalCompetenceCheck,
      ConfidentialityCheck,
      InvoiceCheck
    ]
  }

  get Checks () {
    return this._checks
  }

  async _buildSections (authToken, applicationId, applicationLineId) {
    const applicableRuleSetIds = await ApplicationLine.getValidRulesetIds(authToken, applicationLineId)
    const sections = await Promise.all(
      this.Checks
        // Only include those checks that are valid for this application line
        .filter((Check) => {
          // Always display the permit check
          return Check.name === 'PermitCheck' || applicableRuleSetIds.includes(Check.rulesetId)
        })
        .map((Check) => {
          const check = new Check(authToken, applicationId, applicationLineId)
          return check.buildLines()
        })
    )
    // Please note that each check can build multiple lines resulting in a nested array which is flattened with the reduce
    return sections.reduce((acc, cur) => acc.concat(cur), [])
  }

  async doGet (request, reply) {
    const pageContext = this.createPageContext()
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)
    const applicationLineId = CookieService.getApplicationLineId(request)
    pageContext.sections = await this._buildSections(authToken, applicationId, applicationLineId)

    return reply
      .view('checkBeforeSending', pageContext)
  }

  async doPost (request, reply) {
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)
    const application = await Application.getById(authToken, applicationId)
    application.declaration = true
    await application.save(authToken)
    return reply.redirect(Constants.Routes.APPLICATION_RECEIVED.path)
  }
}
