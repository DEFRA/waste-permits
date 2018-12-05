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

const {
  DESIGNATED_MEMBER_CONTACT_DETAILS,
  BILLING_INVOICING,
  PUBLIC_BODY_MAIN_ADDRESS,
  COMPANY_REGISTERED_ADDRESS
} = require('../../dynamics').AddressTypes

const {
  MANAGEMENT_SYSTEM
} = require('../../dynamics').ApplicationQuestions

const {
  TECHNICAL_QUALIFICATION,
  SITE_PLAN,
  FIRE_PREVENTION_PLAN,
  WASTE_RECOVERY_PLAN,
  WASTE_TYPES_LIST,
  ENVIRONMENTAL_RISK_ASSESSMENT,
  NON_TECHNICAL_SUMMARY,
  MANAGEMENT_SYSTEM_SUMMARY
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

  async getDesignatedMemberDetails () {
    if (!this.data.designatedMemberDetails) {
      const type = DESIGNATED_MEMBER_CONTACT_DETAILS.TYPE
      this.data.designatedMemberDetails = await ContactDetail.list(this.data, { type })
    }
    return this.data.designatedMemberDetails || {}
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
}
