'use strict'

const Stream = require('stream')
const pdf = require('../services/pdf')
const moment = require('moment')
const UploadService = require('../services/upload.service')
const { UploadSubject } = require('../constants')
const RecoveryService = require('../services/recovery.service')
const BaseController = require('./base.controller')
const BaseTaskList = require('../models/taskList/base.taskList')
const PermitCheck = require('../models/checkList/permit.check')
const DrainageCheck = require('../models/checkList/drainage.check')
const SiteCheck = require('../models/checkList/site.check')
const SitePlanCheck = require('../models/checkList/sitePlan.check')
const WasteRecoveryPlanCheck = require('../models/checkList/wasteRecoveryPlan.check')
const FirePreventionPlanCheck = require('../models/checkList/firePreventionPlan.check')
const TechnicalCompetenceCheck = require('../models/checkList/technicalCompetence.check')
const ContactCheck = require('../models/checkList/contact.check')
const PermitHolderCheck = require('../models/checkList/permitHolder.check')
const ConfidentialityCheck = require('../models/checkList/confidentiality.check')
const InvoiceCheck = require('../models/checkList/invoice.check')
const MiningWasteCheck = require('../models/checkList/miningWaste.check')
const WasteTypesListCheck = require('../models/checkList/wasteTypesList.check')
const EnvironmentalRiskAssessmentCheck = require('../models/checkList/environmentalRiskAssessment.check')
const NonTechnicalSummaryCheck = require('../models/checkList/nonTechnicalSummary.check')
const BestAvailableTechniquesAssessmentCheck = require('../models/checkList/bestAvailableTechniquesAssessment.check')
const EnergyEfficiencyReportCheck = require('../models/checkList/energyEfficiencyReport.check')
const AirDispersionModellingReportCheck = require('../models/checkList/airDispersionModellingReport.check')
const ScreeningToolCheck = require('../models/checkList/screeningTool.check')
const ManagementSystemCheck = require('../models/checkList/managementSystem.check')
const NeedToConsult = require('../models/checkList/needToConsult.check')
const McpDetailsCheck = require('../models/checkList/mcpDetails.check')
const McpBusinessActivityCheck = require('../models/checkList/mcpBusinessActivity.check')
const AirQualityManagementAreaCheck = require('../models/checkList/airQualityManagementArea.check')

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
      NeedToConsult,
      NonTechnicalSummaryCheck,
      SiteCheck,
      SitePlanCheck,
      McpDetailsCheck,
      McpBusinessActivityCheck,
      WasteTypesListCheck,
      TechnicalCompetenceCheck,
      AirQualityManagementAreaCheck,
      AirDispersionModellingReportCheck,
      ScreeningToolCheck,
      EnergyEfficiencyReportCheck,
      BestAvailableTechniquesAssessmentCheck,
      FirePreventionPlanCheck,
      WasteRecoveryPlanCheck,
      EnvironmentalRiskAssessmentCheck,
      ManagementSystemCheck,
      MiningWasteCheck,
      ConfidentialityCheck,
      InvoiceCheck
    ]
  }

  get Checks () {
    return this._checks
  }

  async _buildSections (context) {
    const TaskList = await BaseTaskList.getTaskListClass(context)
    const taskList = new TaskList(context)

    // Only include the permit check and those checks that are available for this application
    const availableFlags = await Promise.all(this.Checks.map((Check) => (TaskList.isStandardRules && Check.name === 'PermitCheck') || taskList.isAvailable(Check.task)))
    const availableChecks = this.Checks.filter((Check, index) => availableFlags[index])

    // Map the checks into sections
    const sections = await Promise.all(
      availableChecks
        .map((Check) => {
          const check = new Check(context)
          return check.buildLines()
        })
    )

    // Please note that each check can build multiple lines resulting in a nested array which is flattened with the reduce
    return sections.reduce((acc, cur) => acc.concat(cur), [])
  }

  async doGet (request, h) {
    const pageContext = this.createPageContext(h)
    const context = await RecoveryService.createApplicationContext(h)
    const { application } = context
    const { pdfAction } = request.params
    pageContext.sections = await this._buildSections(request.app.data)

    if (pdfAction === 'pdf-download') {
      const result = await pdf.createPDF(pageContext.sections, application)

      return h.response(result)
        .type('application/pdf')
        .header('Content-type', 'application/pdf')
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const pageContext = this.createPageContext(h)
    pageContext.sections = await this._buildSections(request.app.data)
    const context = await RecoveryService.createApplicationContext(h, { application: true })
    const { application } = context
    let pdfStream = pdf.createPDFStream(pageContext.sections, application)
    const dateStr = moment().format('YYYY-MM-DD-HH-mm-ss')
    const name = `${application.applicationNumber}-application-form-${dateStr}`.replace(/\//g, '_')
    Object.assign(pdfStream, {
      hapi: {
        filename: `${name}.pdf`,
        name,
        headers: 'application/pdf'
      }
    })
    pdfStream.end()
    await UploadService.upload(
      context,
      application,
      pdfStream,
      UploadSubject.ARBITRARY_UPLOADS
    )

    application.declaration = true

    await application.save(request.app.data)

    return this.redirect({ h })
  }
}
