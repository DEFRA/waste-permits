
const BaseTaskList = require('../../models/taskList/base.taskList')

const PermitCheck = require('../../models/checkList/permit.check')
const McpBespokeTypeCheck = require('../../models/checkList/mcpBespokeType.check')
const DrainageCheck = require('../../models/checkList/drainage.check')
const SiteCheck = require('../../models/checkList/site.check')
const SitePlanCheck = require('../../models/checkList/sitePlan.check')
const WasteRecoveryPlanCheck = require('../../models/checkList/wasteRecoveryPlan.check')
const FirePreventionPlanCheck = require('../../models/checkList/firePreventionPlan.check')
const TechnicalCompetenceCheck = require('../../models/checkList/technicalCompetence.check')
const ContactCheck = require('../../models/checkList/contact.check')
const PermitHolderCheck = require('../../models/checkList/permitHolder.check')
const ConfidentialityCheck = require('../../models/checkList/confidentiality.check')
const InvoiceCheck = require('../../models/checkList/invoice.check')
const MiningWasteCheck = require('../../models/checkList/miningWaste.check')
const WasteTypesListCheck = require('../../models/checkList/wasteTypesList.check')
const EnvironmentalRiskAssessmentCheck = require('../../models/checkList/environmentalRiskAssessment.check')
const EmissionsAndMonitoringCheck = require('../../models/checkList/emissionsAndMonitoring.check')
const NonTechnicalSummaryCheck = require('../../models/checkList/nonTechnicalSummary.check')
const BestAvailableTechniquesAssessmentCheck = require('../../models/checkList/bestAvailableTechniquesAssessment.check')
const EnergyEfficiencyReportCheck = require('../../models/checkList/energyEfficiencyReport.check')
const AirDispersionModellingReportCheck = require('../../models/checkList/airDispersionModellingReport.check')
const ScreeningToolCheck = require('../../models/checkList/screeningTool.check')
const ManagementSystemCheck = require('../../models/checkList/managementSystem.check')
const NeedToConsult = require('../../models/checkList/needToConsult.check')
const McpDetailsCheck = require('../../models/checkList/mcpDetails.check')
const McpBusinessActivityCheck = require('../../models/checkList/mcpBusinessActivity.check')
const AirQualityManagementAreaCheck = require('../../models/checkList/airQualityManagementArea.check')
const NoiseVibrationDocumentsCheck = require('../../models/checkList/noiseVibrationDocuments.check')
const ManageHazardousWaste = require('../../models/checkList/manageHazardousWaste.check')
const WasteDisposalAndRecoveryCodes = require('../../models/checkList/wasteDisposalAndRecoveryCodes.check')

module.exports = class CheckList {
  constructor () {
    // List of Checks.
    // Please note order is display order.
    this._checks = [
      PermitCheck,
      McpBespokeTypeCheck,
      DrainageCheck,
      ContactCheck,
      PermitHolderCheck,
      NeedToConsult,
      NonTechnicalSummaryCheck,
      SiteCheck,
      SitePlanCheck,
      McpDetailsCheck,
      McpBusinessActivityCheck,
      WasteDisposalAndRecoveryCodes,
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
      EmissionsAndMonitoringCheck,
      NoiseVibrationDocumentsCheck,
      ManagementSystemCheck,
      ManageHazardousWaste,
      MiningWasteCheck,
      ConfidentialityCheck,
      InvoiceCheck
    ]
  }

  get Checks () {
    return this._checks
  }

  async buildSections (context) {
    const TaskList = await BaseTaskList.getTaskListClass(context)
    const taskList = new TaskList(context)

    // Only include the permit/MCP bespoke type check and those checks that are available for this application
    const availableFlags = await Promise.all(this.Checks.map((Check) => {
      return (TaskList.isStandardRules && Check.name === 'PermitCheck') ||
      (TaskList.isMcpBespoke && Check.name === 'McpBespokeTypeCheck') ||
      taskList.isAvailable(Check.task)
    }))
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
}
