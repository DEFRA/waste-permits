'use strict'

const Constants = require('../constants')
const RecoveryService = require('../services/recovery.service')
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

  async doGet (request, h) {
    const pageContext = this.createPageContext()
    const {authToken, applicationId, applicationLineId} = await RecoveryService.createApplicationContext(h)

    pageContext.sections = await this._buildSections(authToken, applicationId, applicationLineId)

    // If all the task list items are not complete
    const taskList = await TaskList.getByApplicationLineId(authToken, applicationLineId)
    const isComplete = await taskList.isComplete(authToken, applicationId, applicationLineId)

    // If the task list is not complete then redirect back to it and show a validation error
    if (!isComplete) {
      return this.redirect({request, h, redirectPath: `${Constants.Routes.TASK_LIST.path}?showError=true`})
    }

    return this.showView({request, h, viewPath: 'checkBeforeSending', pageContext})
  }

  async doPost (request, h) {
    const {authToken, application} = await RecoveryService.createApplicationContext(h, {application: true})

    application.declaration = true
    application.statusCode = Constants.Dynamics.StatusCode.APPLICATION_RECEIVED
    await application.save(authToken)

    return this.redirect({request, h, redirectPath: Constants.Routes.PAYMENT.PAYMENT_TYPE.path})
  }
}
