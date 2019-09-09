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

  async getUploadedFileDetails (fileSubject, propertyName) {
    const fileDetails = this.data[propertyName]
    if (!fileDetails) {
      this.data[propertyName] = await Annotation.listByApplicationIdAndSubject(this.data, fileSubject)
    }
    return this.data[propertyName] || {}
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
    return this.getUploadedFileDetails(TECHNICAL_QUALIFICATION, 'technicalCompetenceEvidence')
  }

  async getSitePlan () {
    const { sitePlan } = this.data
    if (!sitePlan) {
      this.data.sitePlan = await Annotation.listByApplicationIdAndSubject(this.data, SITE_PLAN)
    }
    return this.data.sitePlan || {}
  }

  async getEnergyEfficiencyReport () {
    return this.getUploadedFileDetails(ENERGY_EFFICIENCY_REPORT, 'energyEfficiencyReport')
  }

  async getEmissionsManagementPlan () {
    return this.getUploadedFileDetails(EMISSIONS_MANAGEMENT_PLAN, 'emissionsManagementPlan')
  }

  async getAirDispersionModellingReport () {
    return this.getUploadedFileDetails(AIR_DISPERSION_MODELLING_REPORT, 'airDispersionModellingReport')
  }

  async getScreeningTool () {
    return this.getUploadedFileDetails(AIR_DISPERSION_MODELLING_REPORT, 'screeningTool')
  }

  async getBestAvailableTechniquesAssessment () {
    return this.getUploadedFileDetails(BEST_AVAILABLE_TECHNIQUES_ASSESSMENT, 'bestAvailableTechniquesAssessment')
  }

  async getWasteRecoveryPlan () {
    return this.getUploadedFileDetails(WASTE_RECOVERY_PLAN, 'wasteRecoveryPlan')
  }

  async getFirePreventionPlan () {
    return this.getUploadedFileDetails(FIRE_PREVENTION_PLAN, 'firePreventionPlan')
  }

  async getWasteTypesList () {
    return this.getUploadedFileDetails(WASTE_TYPES_LIST, 'wasteTypesList')
  }

  async getEnvironmentalRiskAssessment () {
    return this.getUploadedFileDetails(ENVIRONMENTAL_RISK_ASSESSMENT, 'environmentalRiskAssessment')
  }

  async getNonTechnicalSummary () {
    return this.getUploadedFileDetails(NON_TECHNICAL_SUMMARY, 'nonTechnicalSummary')
  }

  async getManagementSystem () {
    const { managementSystem } = this.data
    if (!managementSystem) {
      this.data.managementSystem = await ApplicationAnswer.getByQuestionCode(this.data, MANAGEMENT_SYSTEM.questionCode)
    }
    return this.data.managementSystem || {}
  }

  async getManagementSystemSummary () {
    return this.getUploadedFileDetails(MANAGEMENT_SYSTEM_SUMMARY, 'managementSystemSummary')
  }

  async getNeedToConsult () {
    const { needToConsult } = this.data
    if (!needToConsult) {
      this.data.needToConsult = await NeedToConsult.get(this.data)
    }
    return this.data.needToConsult || {}
  }

  async getTechnicalManagers () {
    return this.getUploadedFileDetails(TECHNICAL_MANAGERS, 'technicalManagers')
  }

  async getMcpDetails () {
    return this.getUploadedFileDetails(MCP_DETAILS, 'mcpDetails')
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
    return this.getUploadedFileDetails(ODOUR_MANAGEMENT_PLAN, 'odourManagementPlan')
  }

  async getSiteConditionReport () {
    return this.getUploadedFileDetails(SITE_CONDITION_REPORT, 'siteConditionReport')
  }
}
