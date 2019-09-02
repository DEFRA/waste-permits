const Constants = require('../../constants')
const Account = require('../../persistence/entities/account.entity')
const Address = require('../../persistence/entities/address.entity')
const Annotation = require('../../persistence/entities/annotation.entity')
const Application = require('../../persistence/entities/application.entity')
const ApplicationAnswer = require('../../persistence/entities/applicationAnswer.entity')
const Location = require('../../persistence/entities/location.entity')
const LocationDetail = require('../../persistence/entities/locationDetail.entity')
const StandardRule = require('../../persistence/entities/standardRule.entity')
const ContactDetail = require('../contactDetail.model')
const CharityDetail = require('../charityDetail.model')
const NeedToConsult = require('../needToConsult.model')
const McpBusinessType = require('../mcpBusinessType.model')
const AirQualityManagementArea = require('../airQualityManagementArea.model')
const TaskDeterminants = require('../taskDeterminants.model')

const {
  BILLING_INVOICING,
  PUBLIC_BODY_MAIN_ADDRESS,
  COMPANY_REGISTERED_ADDRESS
} = require('../../dynamics').AddressTypes

const {
  MANAGEMENT_SYSTEM
} = require('../../dynamics').ApplicationQuestions

const {
  AIR_DISPERSION_MODELLING_REPORT,
  BEST_AVAILABLE_TECHNIQUES_ASSESSMENT,
  ENERGY_EFFICIENCY_REPORT,
  TECHNICAL_QUALIFICATION,
  SITE_PLAN,
  FIRE_PREVENTION_PLAN,
  WASTE_RECOVERY_PLAN,
  WASTE_TYPES_LIST,
  ENVIRONMENTAL_RISK_ASSESSMENT,
  NON_TECHNICAL_SUMMARY,
  MANAGEMENT_SYSTEM_SUMMARY,
  TECHNICAL_MANAGERS,
  MCP_DETAILS,
  ODOUR_MANAGEMENT_PLAN,
  EMISSIONS_MANAGEMENT_PLAN,
  SITE_CONDITION_REPORT
} = Constants.UploadSubject

module.exports = class BaseCheck {
  constructor (data) {
    this.data = data
  }

  get prefix () {
    return 'section'
  }

  buildLine ({ heading, prefix, answers, links }) {
    prefix = prefix ? `${this.prefix}-${prefix}` : this.prefix
    return {
      heading,
      headingId: `${prefix}-heading`,
      answers: answers.map((answer, index) => ({ answerId: `${prefix}-answer${answers.length > 1 ? `-${index + 1}` : ''}`, answer })),
      links: links.map(({ path, type }, index) => ({ linkId: `${prefix}-link${links.length > 1 ? `-${index + 1}` : ''}`, link: path, linkType: type }))
    }
  }

  async getApplication () {
    const { applicationId, application } = this.data
    if (!application) {
      this.data.application = await Application.getById(this.data, applicationId)
    }
    return this.data.application || {}
  }

  async getAgentAccount () {
    const { agentAccount } = this.data
    const { agentId } = await this.getApplication()
    if (!agentAccount) {
      this.data.agentAccount = agentId ? await Account.getById(this.data, agentId) : new Account()
    }
    return this.data.agentAccount || {}
  }

  async getCompanyAccount () {
    const { companyAccount } = this.data
    if (!companyAccount) {
      this.data.companyAccount = await Account.getByApplicationId(this.data)
    }
    return this.data.companyAccount || {}
  }

  async getCompanyRegisteredAddress () {
    if (!this.data.companyRegisteredAddress) {
      const type = COMPANY_REGISTERED_ADDRESS.TYPE
      this.data.companyRegisteredAddress = await ContactDetail.get(this.data, { type })
    }
    return this.data.companyRegisteredAddress || {}
  }

  async getCharityDetails () {
    if (!this.data.charityDetails) {
      const { charityName, charityNumber, charityPermitHolder } = await CharityDetail.get(this.data)
      this.data.charityDetails = { charityName, charityNumber, charityPermitHolder }
    }
    return this.data.charityDetails || {}
  }

  async getMainAddress () {
    if (!this.data.mainAddress) {
      const type = PUBLIC_BODY_MAIN_ADDRESS.TYPE
      this.data.mainAddress = await ContactDetail.get(this.data, { type })
    }
    return this.data.mainAddress || {}
  }

  async getCompanies () {
    if (!this.data.companies) {
      const company = await this.getCompanyAccount()
      this.data.companies = await company.listLinked(this.data)
    }
    return this.data.companies || []
  }

  async listContactDetails ({ TYPE: type }) {
    if (!this.data.contactDetails) {
      this.data.contactDetails = await ContactDetail.list(this.data) || []
    }
    return this.data.contactDetails.filter((contactDetail) => contactDetail.type === type)
  }

  async getContactDetails (addressType) {
    const list = await this.listContactDetails(addressType)
    // return the first found
    return list.pop() || {}
  }

  async getPermitHolderType () {
    return this.data.permitHolderType || {}
  }

  async getBillingInvoicingDetails () {
    return this.getContactDetails(BILLING_INVOICING)
  }

  async getStandardRule () {
    const { standardRule } = this.data
    if (!standardRule) {
      this.data.standardRule = await StandardRule.getByApplicationLineId(this.data)
    }
    return this.data.standardRule || {}
  }

  async getMcpType () {
    const { taskDeterminants } = this.data
    if (!taskDeterminants) {
      this.data.taskDeterminants = await TaskDeterminants.get(this.data)
    }

    return this.data.taskDeterminants.mcpType || {}
  }

  async getLocation () {
    const { location } = this.data
    if (!location) {
      this.data.location = await Location.getByApplicationId(this.data)
    }
    return this.data.location || {}
  }

  async getLocationDetail () {
    const { locationDetail } = this.data
    const { id } = await this.getLocation()
    if (id && !locationDetail) {
      this.data.locationDetail = await LocationDetail.getByLocationId(this.data, id)
    }
    return this.data.locationDetail || {}
  }

  async getLocationAddress () {
    const { locationAddress } = this.data
    const { addressId } = await this.getLocationDetail()
    if (!locationAddress) {
      this.data.locationAddress = await Address.getById(this.data, addressId)
    }
    return this.data.locationAddress || {}
  }

  async getInvoiceAddress () {
    const { invoiceAddress } = this.data
    const { addressId } = await this.getBillingInvoicingDetails()
    if (!invoiceAddress) {
      this.data.invoiceAddress = await Address.getById(this.data, addressId)
    }
    return this.data.invoiceAddress || {}
  }

  async getTechnicalCompetenceEvidence () {
    const { technicalCompetenceEvidence } = this.data
    if (!technicalCompetenceEvidence) {
      this.data.technicalCompetenceEvidence = await Annotation.listByApplicationIdAndSubject(this.data, TECHNICAL_QUALIFICATION)
    }
    return this.data.technicalCompetenceEvidence || {}
  }

  async getSitePlan () {
    const { sitePlan } = this.data
    if (!sitePlan) {
      this.data.sitePlan = await Annotation.listByApplicationIdAndSubject(this.data, SITE_PLAN)
    }
    return this.data.sitePlan || {}
  }

  async getEnergyEfficiencyReport () {
    const { energyEfficiencyReport } = this.data
    if (!energyEfficiencyReport) {
      this.data.energyEfficiencyReport = await Annotation.listByApplicationIdAndSubject(this.data, ENERGY_EFFICIENCY_REPORT)
    }
    return this.data.energyEfficiencyReport || {}
  }

  async getEmissionsManagementPlan () {
    const { emissionsManagementPlan } = this.data
    if (!emissionsManagementPlan) {
      this.data.emissionsManagementPlan = await Annotation.listByApplicationIdAndSubject(this.data, EMISSIONS_MANAGEMENT_PLAN)
    }
    return this.data.emissionsManagementPlan || {}
  }

  async getAirDispersionModellingReport () {
    const { airDispersionModellingReport } = this.data
    if (!airDispersionModellingReport) {
      this.data.airDispersionModellingReport = await Annotation.listByApplicationIdAndSubject(this.data, AIR_DISPERSION_MODELLING_REPORT)
    }
    return this.data.airDispersionModellingReport || {}
  }

  async getScreeningTool () {
    const { screeningTool } = this.data
    if (!screeningTool) {
      this.data.screeningTool = await Annotation.listByApplicationIdAndSubject(this.data, AIR_DISPERSION_MODELLING_REPORT)
    }
    return this.data.screeningTool || {}
  }

  async getBestAvailableTechniquesAssessment () {
    const { bestAvailableTechniquesAssessment } = this.data
    if (!bestAvailableTechniquesAssessment) {
      this.data.bestAvailableTechniquesAssessment = await Annotation.listByApplicationIdAndSubject(this.data, BEST_AVAILABLE_TECHNIQUES_ASSESSMENT)
    }
    return this.data.bestAvailableTechniquesAssessment || {}
  }

  async getWasteRecoveryPlan () {
    const { wasteRecoveryPlan } = this.data
    if (!wasteRecoveryPlan) {
      this.data.wasteRecoveryPlan = await Annotation.listByApplicationIdAndSubject(this.data, WASTE_RECOVERY_PLAN)
    }
    return this.data.wasteRecoveryPlan || {}
  }

  async getFirePreventionPlan () {
    const { firePreventionPlan } = this.data
    if (!firePreventionPlan) {
      this.data.firePreventionPlan = await Annotation.listByApplicationIdAndSubject(this.data, FIRE_PREVENTION_PLAN)
    }
    return this.data.firePreventionPlan || {}
  }

  async getWasteTypesList () {
    const { wasteTypesList } = this.data
    if (!wasteTypesList) {
      this.data.wasteTypesList = await Annotation.listByApplicationIdAndSubject(this.data, WASTE_TYPES_LIST)
    }
    return this.data.wasteTypesList || {}
  }

  async getEnvironmentalRiskAssessment () {
    const { environmentalRiskAssessment } = this.data
    if (!environmentalRiskAssessment) {
      this.data.environmentalRiskAssessment = await Annotation.listByApplicationIdAndSubject(this.data, ENVIRONMENTAL_RISK_ASSESSMENT)
    }
    return this.data.environmentalRiskAssessment || {}
  }

  async getNonTechnicalSummary () {
    const { nonTechnicalSummary } = this.data
    if (!nonTechnicalSummary) {
      this.data.nonTechnicalSummary = await Annotation.listByApplicationIdAndSubject(this.data, NON_TECHNICAL_SUMMARY)
    }
    return this.data.nonTechnicalSummary || {}
  }

  async getManagementSystem () {
    const { managementSystem } = this.data
    if (!managementSystem) {
      this.data.managementSystem = await ApplicationAnswer.getByQuestionCode(this.data, MANAGEMENT_SYSTEM.questionCode)
    }
    return this.data.managementSystem || {}
  }

  async getManagementSystemSummary () {
    const { managementSystemSummary } = this.data
    if (!managementSystemSummary) {
      this.data.managementSystemSummary = await Annotation.listByApplicationIdAndSubject(this.data, MANAGEMENT_SYSTEM_SUMMARY)
    }
    return this.data.managementSystemSummary || []
  }

  async getNeedToConsult () {
    const { needToConsult } = this.data
    if (!needToConsult) {
      this.data.needToConsult = await NeedToConsult.get(this.data)
    }
    return this.data.needToConsult || {}
  }

  async getTechnicalManagers () {
    const { technicalManagers } = this.data
    if (!technicalManagers) {
      this.data.technicalManagers = await Annotation.listByApplicationIdAndSubject(this.data, TECHNICAL_MANAGERS)
    }
    return this.data.technicalManagers || {}
  }

  async getMcpDetails () {
    const { mcpDetails } = this.data
    if (!mcpDetails) {
      this.data.mcpDetails = await Annotation.listByApplicationIdAndSubject(this.data, MCP_DETAILS)
    }
    return this.data.mcpDetails || {}
  }

  async getMcpBusinessType () {
    const { mcpBusinessType } = this.data
    if (!mcpBusinessType) {
      this.data.mcpBusinessType = await McpBusinessType.get(this.data)
    }
    return this.data.mcpBusinessType || {}
  }

  async getAirQualityManagementArea () {
    const { airQualityManagementArea } = this.data
    if (!airQualityManagementArea) {
      this.data.airQualityManagementArea = await AirQualityManagementArea.get(this.data)
    }
    return this.data.airQualityManagementArea || {}
  }

  async getOdourManagementPlan () {
    const { odourManagementPlan } = this.data
    if (!odourManagementPlan) {
      this.data.odourManagementPlan = await Annotation.listByApplicationIdAndSubject(this.data, ODOUR_MANAGEMENT_PLAN)
    }
    return this.data.odourManagementPlan || {}
  }

  async getSiteConditionReport () {
    const { siteConditionReport } = this.data
    if (!siteConditionReport) {
      this.data.siteConditionReport = await Annotation.listByApplicationIdAndSubject(this.data, SITE_CONDITION_REPORT)
    }
    return this.data.siteConditionReport || {}
  }
}
