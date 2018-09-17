const Constants = require('../../constants')
const Account = require('../account.model')
const Address = require('../address.model')
const AddressDetail = require('../addressDetail.model')
const Annotation = require('../annotation.model')
const Application = require('../application.model')
const ApplicationContact = require('../applicationContact.model')
const Contact = require('../contact.model')
const Location = require('../location.model')
const LocationDetail = require('../locationDetail.model')
const StandardRule = require('../standardRule.model')
const Utilities = require('../../utilities/utilities')
const { COMPANY_DIRECTOR, LLP_DESIGNATED_MEMBER } = require('../../dynamics').AccountRoleCodes
const { TECHNICAL_QUALIFICATION, SITE_PLAN, FIRE_PREVENTION_PLAN, WASTE_RECOVERY_PLAN } = Constants.UploadSubject

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

  async getContact () {
    const { contact } = this.data
    const { contactId } = await this.getApplication()
    if (!contact) {
      this.data.contact = contactId ? await Contact.getById(this.data, contactId) : new Contact()
    }
    return this.data.contact || {}
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
    const { applicationId, companyAccount } = this.data
    if (!companyAccount) {
      this.data.companyAccount = await Account.getByApplicationId(this.data, applicationId)
    }
    return this.data.companyAccount || {}
  }

  async getCompanySecretaryDetails () {
    const { applicationId, companySecretaryDetails } = this.data
    if (!companySecretaryDetails) {
      this.data.companySecretaryDetails = await AddressDetail.getCompanySecretaryDetails(this.data, applicationId)
    }
    return this.data.companySecretaryDetails || {}
  }

  async getCompanyRegisteredAddress () {
    const { companyRegisteredAddress } = this.data
    if (!companyRegisteredAddress) {
      const { id } = await this.getCompanyAccount()
      const addressDetail = await AddressDetail.getCompanyRegisteredDetails(this.data, id)
      this.data.companyRegisteredAddress = addressDetail ? await Address.getById(this.data, addressDetail.addressId) : undefined
    }
    return this.data.companyRegisteredAddress || {}
  }

  async getCompanies () {
    const { companies } = this.data
    if (!companies) {
      const company = await this.getCompanyAccount()
      this.data.companies = await company.listLinked(this.data)
    }
    return this.data.companies || []
  }

  async getDesignatedMemberDetails () {
    const { applicationId, designatedMemberDetails } = this.data
    if (!designatedMemberDetails) {
      this.data.designatedMemberDetails = await AddressDetail.getDesignatedMemberDetails(this.data, applicationId)
    }
    return this.data.designatedMemberDetails || {}
  }

  async getDirectors () {
    const { applicationId, directors } = this.data
    const { id } = await this.getCompanyAccount()
    if (!directors) {
      this.data.directors = await Contact.list(this.data, id, COMPANY_DIRECTOR)
      await Promise.all(this.data.directors.map(async (director) => {
        let applicationContact = await ApplicationContact.get(this.data, applicationId, director.id)
        if (applicationContact && applicationContact.directorDob) {
          director.dob.day = Utilities.extractDayFromDate(applicationContact.directorDob)
        }
      }))
    }
    return this.data.directors || []
  }

  async getMembers () {
    const { applicationId, members } = this.data
    const { id } = await this.getCompanyAccount()
    if (!members) {
      this.data.members = await Contact.list(this.data, id, LLP_DESIGNATED_MEMBER)
      await Promise.all(this.data.members.map(async (member) => {
        let applicationContact = await ApplicationContact.get(this.data, applicationId, member.id)
        if (applicationContact && applicationContact.directorDob) {
          member.dob.day = Utilities.extractDayFromDate(applicationContact.directorDob)
        }
      }))
    }
    return this.data.members || []
  }

  async getPartners () {
    const { applicationId, partners } = this.data
    if (!partners) {
      const list = await ApplicationContact.listByApplicationId(this.data, applicationId)
      this.data.partners = await Promise.all(list.map(async ({ id, contactId, directorDob }) => {
        const { firstName, lastName } = await Contact.getById(this.data, contactId)
        const name = `${firstName} ${lastName}`
        const [year, month, day] = directorDob.split('-')
        const dob = Utilities.formatDate({ year, month, day })
        const { email, telephone, addressId } = await AddressDetail.getPartnerDetails(this.data, applicationId, contactId)
        const address = await Address.getById(this.data, addressId)
        return { name, email, telephone, dob, address }
      }))
    }
    return this.data.partners || {}
  }

  async getPrimaryContactDetails () {
    const { applicationId, primaryContactDetails } = this.data
    if (!primaryContactDetails) {
      this.data.primaryContactDetails = await AddressDetail.getPrimaryContactDetails(this.data, applicationId)
    }
    return this.data.primaryContactDetails || {}
  }

  async getPermitHolderType () {
    const { permitHolderType } = this.data
    return permitHolderType || {}
  }

  async getIndividualPermitHolder () {
    const { applicationId, individualPermitHolder } = this.data
    if (!individualPermitHolder) {
      this.data.individualPermitHolder = await Contact.getIndividualPermitHolderByApplicationId(this.data, applicationId)
    }
    return this.data.individualPermitHolder || {}
  }

  async getIndividualPermitHolderDetails () {
    const { applicationId, individualPermitHolderDetails } = this.data
    if (!individualPermitHolderDetails) {
      this.data.individualPermitHolderDetails = await AddressDetail.getIndividualPermitHolderDetails(this.data, applicationId)
    }
    return this.data.individualPermitHolderDetails || {}
  }

  async getIndividualPermitHolderAddress () {
    const { applicationId, individualPermitHolderAddress } = this.data
    if (!individualPermitHolderAddress) {
      const permitHolderDetails = await AddressDetail.getIndividualPermitHolderDetails(this.data, applicationId)
      this.data.individualPermitHolderAddress = await Address.getById(this.data, permitHolderDetails.addressId)
    }
    return this.data.individualPermitHolderAddress || {}
  }

  async getBillingInvoicingDetails () {
    const { applicationId } = this.data
    if (!this.data.billingInvoicingDetails) {
      this.data.billingInvoicingDetails = await AddressDetail.getBillingInvoicingDetails(this.data, applicationId)
    }
    return this.data.billingInvoicingDetails || {}
  }

  async getStandardRule () {
    const { applicationLineId, standardRule } = this.data
    if (!standardRule) {
      this.data.standardRule = await StandardRule.getByApplicationLineId(this.data, applicationLineId)
    }
    return this.data.standardRule || {}
  }

  async getLocation () {
    const { applicationId, applicationLineId, location } = this.data
    if (!location) {
      this.data.location = await Location.getByApplicationId(this.data, applicationId, applicationLineId)
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
    const { applicationId, technicalCompetenceEvidence } = this.data
    if (!technicalCompetenceEvidence) {
      this.data.technicalCompetenceEvidence = await Annotation.listByApplicationIdAndSubject(this.data, applicationId, TECHNICAL_QUALIFICATION)
    }
    return this.data.technicalCompetenceEvidence || {}
  }

  async getSitePlan () {
    const { applicationId, sitePlan } = this.data
    if (!sitePlan) {
      this.data.sitePlan = await Annotation.listByApplicationIdAndSubject(this.data, applicationId, SITE_PLAN)
    }
    return this.data.sitePlan || {}
  }

  async getWasteRecoveryPlan () {
    const { applicationId, wasteRecoveryPlan } = this.data
    if (!wasteRecoveryPlan) {
      this.data.wasteRecoveryPlan = await Annotation.listByApplicationIdAndSubject(this.data, applicationId, WASTE_RECOVERY_PLAN)
    }
    return this.data.wasteRecoveryPlan || {}
  }

  async getFirePreventionPlan () {
    const { applicationId, firePreventionPlan } = this.data
    if (!firePreventionPlan) {
      this.data.firePreventionPlan = await Annotation.listByApplicationIdAndSubject(this.data, applicationId, FIRE_PREVENTION_PLAN)
    }
    return this.data.firePreventionPlan || {}
  }
}
