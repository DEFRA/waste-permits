'use strict'

const Dynamics = require('../dynamics')
const Routes = require('../routes')
const RecoveryService = require('../services/recovery.service')
const ApplicationLine = require('../models/applicationLine.model')
const BaseController = require('./base.controller')
const TaskList = require('../models/taskList/taskList.model')
const PermitCheck = require('../models/checkYourAnswers/permit.check')
const DrainageCheck = require('../models/checkYourAnswers/drainage.check')
const SiteCheck = require('../models/checkYourAnswers/site.check')
const SitePlanCheck = require('../models/checkYourAnswers/sitePlan.check')
const WasteRecoveryPlanCheck = require('../models/checkYourAnswers/wasteRecoveryPlan.check')
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
      DrainageCheck,
      ContactCheck,
      PermitHolderCheck,
      SiteCheck,
      SitePlanCheck,
      WasteRecoveryPlanCheck,
      TechnicalCompetenceCheck,
      FirePreventionPlanCheck,
      ConfidentialityCheck,
      InvoiceCheck
    ]
  }

  get Checks () {
    return this._checks
  }

  async _buildSections (context) {
    const {applicationLineId} = context
    const applicableRuleSetIds = await ApplicationLine.getValidRulesetIds(context, applicationLineId)
    const sections = await Promise.all(
      this.Checks
        // Only include those checks that are valid for this application line
        .filter((Check) => {
          // Always display the permit check
          return Check.name === 'PermitCheck' || applicableRuleSetIds.includes(Check.rulesetId)
        })
        .map((Check) => {
          const check = new Check(context)
          return check.buildLines()
        })
    )
    // Please note that each check can build multiple lines resulting in a nested array which is flattened with the reduce
    return sections.reduce((acc, cur) => acc.concat(cur), [])
  }

  async doGet (request, h) {
    const pageContext = this.createPageContext()
    const context = request.app.data
    await RecoveryService.createApplicationContext(h, {application: true})
    const {applicationId, applicationLineId} = context

    pageContext.sections = await this._buildSections(context)

    // If all the task list items are not complete
    const taskList = await TaskList.getByApplicationLineId(context, applicationLineId)
    const isComplete = await taskList.isComplete(context, applicationId, applicationLineId)

    // If the task list is not complete then redirect back to it and show a validation error
    if (!isComplete) {
      return this.redirect({request, h, redirectPath: `${Routes.TASK_LIST.path}?showError=true`})
    }

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h) {
    const {application} = await RecoveryService.createApplicationContext(h, {application: true})

    application.declaration = true
    application.statusCode = Dynamics.StatusCode.APPLICATION_RECEIVED
    application.submittedOn = Date.now()

    await application.save(request.app.data)

    return this.redirect({request, h, redirectPath: Routes.PAYMENT_TYPE.path})
  }
}
