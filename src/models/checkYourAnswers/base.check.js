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
const CompanyLookupService = require('../../services/companyLookup.service')
const Utilities = require('../../utilities/utilities')
const {COMPANY_DIRECTOR} = Constants.Dynamics
const {TECHNICAL_QUALIFICATION, SITE_PLAN, FIRE_PREVENTION_PLAN} = Constants.UploadSubject

module.exports = class BaseCheck {
  constructor (data) {
    this.data = data
  }

  get prefix () {
    return 'section'
  }

  buildLine ({heading, prefix, answers, links}) {
    prefix = prefix ? `${this.prefix}-${prefix}` : this.prefix
    return {
      heading,
      headingId: `${prefix}-heading`,
      answers: answers.map((answer, index) => ({answerId: `${prefix}-answer${answers.length > 1 ? `-${index + 1}` : ''}`, answer})),
      links: links.map(({path, type}, index) => ({linkId: `${prefix}-link${links.length > 1 ? `-${index + 1}` : ''}`, link: path, linkType: type}))
    }
  }

  async getApplication () {
    const {authToken, applicationId, application} = this.data
    if (!application) {
      this.data.application = await Application.getById(authToken, applicationId)
    }
    return this.data.application || {}
  }

  async getContact () {
    const {authToken, contact} = this.data
    const {contactId} = await this.getApplication()
    if (!contact) {
      this.data.contact = contactId ? await Contact.getById(authToken, contactId) : new Contact()
    }
    return this.data.contact || {}
  }

  async getAgentAccount () {
    const {authToken, agentAccount} = this.data
    const {agentId} = await this.getApplication()
    if (!agentAccount) {
      this.data.agentAccount = agentId ? await Account.getById(authToken, agentId) : new Account()
    }
    return this.data.agentAccount || {}
  }

  async getCompany () {
    const {companyNumber, company} = await this.getCompanyAccount()
    if (!company) {
      this.data.company = await CompanyLookupService.getCompany(companyNumber)
    }
    return this.data.company || {}
  }

  async getCompanyAccount () {
    const {authToken, applicationId, companyAccount} = this.data
    if (!companyAccount) {
      this.data.companyAccount = await Account.getByApplicationId(authToken, applicationId)
    }
    return this.data.companyAccount || {}
  }

  async getCompanySecretaryDetails () {
    const {authToken, applicationId, companySecretaryDetails} = this.data
    if (!companySecretaryDetails) {
      this.data.companySecretaryDetails = await AddressDetail.getCompanySecretaryDetails(authToken, applicationId)
    }
    return this.data.companySecretaryDetails || {}
  }

  async getDirectors () {
    const {authToken, applicationId, directors} = this.data
    const {id} = await this.getCompanyAccount()
    if (!directors) {
      this.data.directors = await Contact.list(authToken, id, COMPANY_DIRECTOR)
      await Promise.all(this.data.directors.map(async (director) => {
        let applicationContact = await ApplicationContact.get(authToken, applicationId, director.id)
        if (applicationContact && applicationContact.directorDob) {
          director.dob.day = Utilities.extractDayFromDate(applicationContact.directorDob)
        }
      }))
    }
    return this.data.directors || []
  }

  async getPrimaryContactDetails () {
    const {authToken, applicationId, primaryContactDetails} = this.data
    if (!primaryContactDetails) {
      this.data.primaryContactDetails = await AddressDetail.getPrimaryContactDetails(authToken, applicationId)
    }
    return this.data.primaryContactDetails || {}
  }

  async getIndividualPermitHolder () {
    const {authToken, applicationId, individualPermitHolder} = this.data
    if (!individualPermitHolder) {
      this.data.individualPermitHolder = await Contact.getIndividualPermitHolderByApplicationId(authToken, applicationId)
    }
    return this.data.individualPermitHolder || {}
  }

  async getIndividualPermitHolderDetails () {
    const {authToken, applicationId, individualPermitHolderDetails} = this.data
    if (!individualPermitHolderDetails) {
      this.data.individualPermitHolderDetails = await AddressDetail.getIndividualPermitHolderDetails(authToken, applicationId)
    }
    return this.data.individualPermitHolderDetails || {}
  }

  async getIndividualPermitHolderAddress () {
    const {authToken, individualPermitHolderAddress} = this.data
    if (!individualPermitHolderAddress) {
      const permitHolderDetails = await this.getIndividualPermitHolderDetails()
      this.data.individualPermitHolderAddress = await Address.getById(authToken, permitHolderDetails.addressId)
    }
    return this.data.individualPermitHolderAddress || {}
  }

  async getBillingInvoicingDetails () {
    const {authToken, applicationId} = this.data
    if (!this.data.billingInvoicingDetails) {
      this.data.billingInvoicingDetails = await AddressDetail.getBillingInvoicingDetails(authToken, applicationId)
    }
    return this.data.billingInvoicingDetails || {}
  }

  async getStandardRule () {
    const {authToken, applicationLineId, standardRule} = this.data
    if (!standardRule) {
      this.data.standardRule = await StandardRule.getByApplicationLineId(authToken, applicationLineId)
    }
    return this.data.standardRule || {}
  }

  async getLocation () {
    const {authToken, applicationId, applicationLineId, location} = this.data
    if (!location) {
      this.data.location = await Location.getByApplicationId(authToken, applicationId, applicationLineId)
    }
    return this.data.location || {}
  }

  async getLocationDetail () {
    const {authToken, locationDetail} = this.data
    const {id} = await this.getLocation()
    if (!locationDetail) {
      this.data.locationDetail = await LocationDetail.getByLocationId(authToken, id)
    }
    return this.data.locationDetail || {}
  }

  async getLocationAddress () {
    const {authToken, locationAddress} = this.data
    const {addressId} = await this.getLocationDetail()
    if (!locationAddress) {
      this.data.locationAddress = await Address.getById(authToken, addressId)
    }
    return this.data.locationAddress || {}
  }

  async getInvoiceAddress () {
    const {authToken, invoiceAddress} = this.data
    const {addressId} = await this.getBillingInvoicingDetails()
    if (!invoiceAddress) {
      this.data.invoiceAddress = await Address.getById(authToken, addressId)
    }
    return this.data.invoiceAddress || {}
  }

  async getTechnicalCompetenceEvidence () {
    const {authToken, applicationId, technicalCompetenceEvidence} = this.data
    if (!technicalCompetenceEvidence) {
      this.data.technicalCompetenceEvidence = await Annotation.listByApplicationIdAndSubject(authToken, applicationId, TECHNICAL_QUALIFICATION)
    }
    return this.data.technicalCompetenceEvidence || {}
  }

  async getSitePlan () {
    const {authToken, applicationId, sitePlan} = this.data
    if (!sitePlan) {
      this.data.sitePlan = await Annotation.listByApplicationIdAndSubject(authToken, applicationId, SITE_PLAN)
    }
    return this.data.sitePlan || {}
  }

  async getFirePreventionPlan () {
    const {authToken, applicationId, firePreventionPlan} = this.data
    if (!firePreventionPlan) {
      this.data.firePreventionPlan = await Annotation.listByApplicationIdAndSubject(authToken, applicationId, FIRE_PREVENTION_PLAN)
    }
    return this.data.firePreventionPlan || {}
  }
}
