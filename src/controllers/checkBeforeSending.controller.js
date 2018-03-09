'use strict'

const Constants = require('../constants')
const ApplicationLine = require('../models/applicationLine.model')
const BaseController = require('./base.controller')
const TaskList = require('../models/taskList/taskList.model')
const PermitCheck = require('../models/checkYourAnswers/permit.check')
const SiteCheck = require('../models/checkYourAnswers/site.check')
const SitePlanCheck = require('../models/checkYourAnswers/sitePlan.check')
const FirePreventionPlanCheck = require('../models/checkYourAnswers/firePreventionPlan.check')
const TechnicalCompetenceCheck = require('../models/checkYourAnswers/technicalCompetence.check')
const ContactCheck = require('../models/checkYourAnswers/contact.check')
const PermitHolderCheck = require('../models/checkYourAnswers/permitHolder.check')
const ConfidentialityCheck = require('../models/checkYourAnswers/confidentiality.check')
const InvoiceCheck = require('../models/checkYourAnswers/invoice.check')

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
      SitePlanCheck,
      TechnicalCompetenceCheck,
      FirePreventionPlanCheck,
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
    const {authToken, applicationId, applicationLineId, application} = await this.createApplicationContext(request, {application: true})

    pageContext.sections = await this._buildSections(authToken, applicationId, applicationLineId)

    // If all the task list items are not complete
    if (!TaskList.isComplete(authToken, application.id)) {
      return this.redirect(request, reply, Constants.Routes.ERROR.NOT_COMPLETE.path)
    } else {
      return this.showView(request, reply, 'checkBeforeSending', pageContext)
    }
  }

  async doPost (request, reply) {
    const {authToken, application} = await this.createApplicationContext(request, {application: true})

    application.declaration = true
    await application.save(authToken)

    return this.redirect(request, reply, Constants.Routes.PAY_TYPE.path)
  }
}
