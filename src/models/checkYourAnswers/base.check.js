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
  constructor (authToken, applicationId, applicationLineId) {
    this.authToken = authToken
    this.applicationId = applicationId
    this.applicationLineId = applicationLineId
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
    const {authToken, applicationId} = this
    if (!this._application) {
      this._application = await Application.getById(authToken, applicationId)
    }
    return this._application || {}
  }

  async getContact () {
    const {authToken} = this
    const {contactId} = await this.getApplication()
    if (!this._contact) {
      this._contact = contactId ? await Contact.getById(authToken, contactId) : new Contact()
    }
    return this._contact || {}
  }

  async getAgentAccount () {
    const {authToken} = this
    const {agentId} = await this.getApplication()
    if (!this._agentAccount) {
      this._agentAccount = agentId ? await Account.getById(authToken, agentId) : new Account()
    }
    return this._agentAccount || {}
  }

  async getCompany () {
    const {companyNumber} = await this.getCompanyAccount()
    if (!this._company) {
      this._company = await CompanyLookupService.getCompany(companyNumber)
    }
    return this._company || {}
  }

  async getCompanyAccount () {
    const {authToken, applicationId} = this
    if (!this._companyAccount) {
      this._companyAccount = await Account.getByApplicationId(authToken, applicationId)
    }
    return this._companyAccount || {}
  }

  async getCompanySecretaryDetails () {
    const {authToken, applicationId} = this
    if (!this._companySecretaryDetails) {
      this._companySecretaryDetails = await AddressDetail.getCompanySecretaryDetails(authToken, applicationId)
    }
    return this._companySecretaryDetails || {}
  }

  async getDirectors () {
    const {authToken, applicationId} = this
    const {id} = await this.getCompanyAccount()
    if (!this._directors) {
      this._directors = await Contact.list(authToken, id, COMPANY_DIRECTOR)
      await Promise.all(this._directors.map(async (director) => {
        let applicationContact = await ApplicationContact.get(authToken, applicationId, director.id)
        if (applicationContact && applicationContact.directorDob) {
          director.dob.day = Utilities.extractDayFromDate(applicationContact.directorDob)
        }
      }))
    }
    return this._directors || []
  }

  async getPrimaryContactDetails () {
    const {authToken, applicationId} = this
    if (!this._primaryContactDetails) {
      this._primaryContactDetails = await AddressDetail.getPrimaryContactDetails(authToken, applicationId)
    }
    return this._primaryContactDetails || {}
  }

  async getBillingInvoicingDetails () {
    const {authToken, applicationId} = this
    if (!this._billingInvoicingDetails) {
      this._billingInvoicingDetails = await AddressDetail.getBillingInvoicingDetails(authToken, applicationId)
    }
    return this._billingInvoicingDetails || {}
  }

  async getStandardRule () {
    const {authToken, applicationLineId} = this
    if (!this._standardRule) {
      this._standardRule = await StandardRule.getByApplicationLineId(authToken, applicationLineId)
    }
    return this._standardRule || {}
  }

  async getLocation () {
    const {authToken, applicationId, applicationLineId} = this
    if (!this._location) {
      this._location = await Location.getByApplicationId(authToken, applicationId, applicationLineId)
    }
    return this._location || {}
  }

  async getLocationDetail () {
    const {authToken} = this
    const {id} = await this.getLocation()
    if (!this._locationDetail) {
      this._locationDetail = await LocationDetail.getByLocationId(authToken, id)
    }
    return this._locationDetail || {}
  }

  async getLocationAddress () {
    const {authToken} = this
    const {addressId} = await this.getLocationDetail()
    if (!this._locationAddress) {
      this._locationAddress = await Address.getById(authToken, addressId)
    }
    return this._locationAddress || {}
  }

  async getInvoiceAddress () {
    const {authToken} = this
    const {addressId} = await this.getBillingInvoicingDetails()
    if (!this._invoiceAddress) {
      this._invoiceAddress = await Address.getById(authToken, addressId)
    }
    return this._invoiceAddress || {}
  }

  async getTechnicalCompetenceEvidence () {
    const {authToken, applicationId} = this
    if (!this._technicalCompetenceEvidence) {
      this._technicalCompetenceEvidence = await Annotation.listByApplicationIdAndSubject(authToken, applicationId, TECHNICAL_QUALIFICATION)
    }
    return this._technicalCompetenceEvidence || {}
  }

  async getSitePlan () {
    const {authToken, applicationId} = this
    if (!this._sitePlan) {
      this._sitePlan = await Annotation.listByApplicationIdAndSubject(authToken, applicationId, SITE_PLAN)
    }
    return this._sitePlan || {}
  }

  async getFirePreventionPlan () {
    const {authToken, applicationId} = this
    if (!this._firePreventionPlan) {
      this._firePreventionPlan = await Annotation.listByApplicationIdAndSubject(authToken, applicationId, FIRE_PREVENTION_PLAN)
    }
    return this._firePreventionPlan || {}
  }
}
