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
const DataStore = require('../dataStore.model')
const TaskDeterminants = require('../taskDeterminants.model')
const WasteDisposalAndRecoveryCodes = require('../wasteDisposalAndRecoveryCodes.model')
const WasteWeights = require('../wasteWeights.model')

const {
  BILLING_INVOICING,
  PUBLIC_BODY_MAIN_ADDRESS,
  COMPANY_REGISTERED_ADDRESS
} = require('../../dynamics').AddressTypes

const {
  MANAGEMENT_SYSTEM
} = require('../../dynamics').ApplicationQuestions

const {
  EMISSIONS_AND_MONITORING_DETAILS
} = require('../../constants').UploadSubject

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

  async getEmissionsAndMonitoringDetails () {
    const { emissionsAndMonitoringDetails } = this.data
    if (!emissionsAndMonitoringDetails) {
      const { data: { emissionsAndMonitoringDetailsRequired } } = await DataStore.get(this.data)
      if (emissionsAndMonitoringDetailsRequired) {
        this.data.emissionsAndMonitoringDetails = {
          emissionsAndMonitoringDetailsRequired: emissionsAndMonitoringDetailsRequired,
          files: await Annotation.listByApplicationIdAndSubject(this.data, EMISSIONS_AND_MONITORING_DETAILS)
        }
      } else {
        this.data.emissionsAndMonitoringDetails = {
          emissionsAndMonitoringDetailsRequired: false
        }
      }
    }
    return this.data.emissionsAndMonitoringDetails || {}
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

  async getManagementSystem () {
    const { managementSystem } = this.data
    if (!managementSystem) {
      this.data.managementSystem = await ApplicationAnswer.getByQuestionCode(this.data, MANAGEMENT_SYSTEM.questionCode)
    }
    return this.data.managementSystem || {}
  }

  async getNeedToConsult () {
    const { needToConsult } = this.data
    if (!needToConsult) {
      this.data.needToConsult = await NeedToConsult.get(this.data)
    }
    return this.data.needToConsult || {}
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

  async getAllWasteDisposalAndRecoveryCodes () {
    const { allWasteDisposalAndRecoveryCodes } = this.data
    if (!allWasteDisposalAndRecoveryCodes) {
      this.data.allWasteDisposalAndRecoveryCodes = await WasteDisposalAndRecoveryCodes.getAllForApplication(this.data)
    }
    return this.data.allWasteDisposalAndRecoveryCodes || []
  }

  async getAllWasteWeights () {
    const { allWasteWeights } = this.data
    if (!allWasteWeights) {
      this.data.allWasteWeights = await WasteWeights.getAllForApplication(this.data)
    }
    return this.data.allWasteWeights || []
  }
}
