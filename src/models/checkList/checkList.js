
const BaseTaskList = require('../taskList/base.taskList')

const PermitCheck = require('./permit.check')
const McpBespokeTypeCheck = require('./mcpBespokeType.check')
const DrainageCheck = require('./drainage.check')
const SiteCheck = require('./site.check')
const SitePlanCheck = require('./sitePlan.check')
const WasteRecoveryPlanCheck = require('./wasteRecoveryPlan.check')
const FirePreventionPlanCheck = require('./firePreventionPlan.check')
const TechnicalCompetenceCheck = require('./technicalCompetence.check')
const ContactCheck = require('./contact.check')
const PermitHolderCheck = require('./permitHolder.check')
const ConfidentialityCheck = require('./confidentiality.check')
const InvoiceCheck = require('./invoice.check')
const MiningWasteCheck = require('./miningWaste.check')
const WasteTypesListCheck = require('./wasteTypesList.check')
const EnvironmentalRiskAssessmentCheck = require('./environmentalRiskAssessment.check')
const EmissionsAndMonitoringCheck = require('./emissionsAndMonitoring.check')
const NonTechnicalSummaryCheck = require('./nonTechnicalSummary.check')
const BestAvailableTechniquesAssessmentCheck = require('./bestAvailableTechniquesAssessment.check')
const EnergyEfficiencyReportCheck = require('./energyEfficiencyReport.check')
const AirDispersionModellingReportCheck = require('./airDispersionModellingReport.check')
const ScreeningToolCheck = require('./screeningTool.check')
const ManagementSystemCheck = require('./managementSystem.check')
const NeedToConsult = require('./needToConsult.check')
const McpDetailsCheck = require('./mcpDetails.check')
const McpBusinessActivityCheck = require('./mcpBusinessActivity.check')
const AirQualityManagementAreaCheck = require('./airQualityManagementArea.check')
const NoiseVibrationDocumentsCheck = require('./noiseVibrationDocuments.check')
const ManageHazardousWaste = require('./manageHazardousWaste.check')
const WasteDisposalAndRecoveryCodes = require('./wasteDisposalAndRecoveryCodes.check')
const ClinicalWasteAppendix = require('./clinicalWasteAppendix.check')
const WasteWeights = require('./wasteWeights.check')
const ClimateChangeRiskScreeningCheck = require('./climateChangeRiskScreening.check')
const PestManagementPlanCheck = require('./pestManagementPlan.check')
const OdourManagementPlanCheck = require('./odourManagementPlan.check')
const EmissionsManagementPlanCheck = require('./emissionsManagementPlan.check')
const SiteConditionReportCheck = require('./siteConditionReport.check')
const TechnicalStandardsCheck = require('./technicalStandards.check')
const BespokePermitCheck = require('./bespokePermit.check')
const PreApplicationCheck = require('./preApplication.check')
const WasteTreatmentCapacityCheck = require('./wasteTreatmentCapacity.check')

module.exports = class CheckList {
  constructor () {
    // List of Checks.
    // Please note order is display order.
    this._checks = [
      PreApplicationCheck,
      DrainageCheck,
      ContactCheck,
      PermitHolderCheck,
      PermitCheck,
      ConfidentialityCheck,
      InvoiceCheck,
      NeedToConsult,
      SiteCheck,
      SitePlanCheck,
      AirQualityManagementAreaCheck,
      SiteConditionReportCheck,
      NonTechnicalSummaryCheck,
      McpBespokeTypeCheck,
      BespokePermitCheck,
      McpDetailsCheck,
      McpBusinessActivityCheck,
      MiningWasteCheck,
      WasteWeights,
      WasteTreatmentCapacityCheck,
      WasteTypesListCheck,
      WasteDisposalAndRecoveryCodes,
      AirDispersionModellingReportCheck,
      ScreeningToolCheck,
      EnergyEfficiencyReportCheck,
      BestAvailableTechniquesAssessmentCheck,
      TechnicalCompetenceCheck,
      ManagementSystemCheck,
      FirePreventionPlanCheck,
      WasteRecoveryPlanCheck,
      EnvironmentalRiskAssessmentCheck,
      ClimateChangeRiskScreeningCheck,
      EmissionsAndMonitoringCheck,
      TechnicalStandardsCheck,
      ClinicalWasteAppendix,
      ManageHazardousWaste,
      EmissionsManagementPlanCheck,
      NoiseVibrationDocumentsCheck,
      OdourManagementPlanCheck,
      PestManagementPlanCheck
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
      (TaskList.isBespoke && Check.name === 'BespokePermitCheck') ||
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
