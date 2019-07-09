const Constants = require('../../src/constants')

const Account = require('../../src/persistence/entities/account.entity')
const Address = require('../../src/persistence/entities/address.entity')
const AddressDetail = require('../../src/persistence/entities/addressDetail.entity')
const Application = require('../../src/persistence/entities/application.entity')
const Annotation = require('../../src/persistence/entities/annotation.entity')
const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')
const ApplicationData = require('../../src/persistence/entities/applicationData.entity')
const ApplicationLine = require('../../src/persistence/entities/applicationLine.entity')
const ApplicationReturn = require('../../src/persistence/entities/applicationReturn.entity')
const Configuration = require('../../src/persistence/entities/configuration.entity')
const Contact = require('../../src/persistence/entities/contact.entity')
const Location = require('../../src/persistence/entities/location.entity')
const LocationDetail = require('../../src/persistence/entities/locationDetail.entity')
const Payment = require('../../src/persistence/entities/payment.entity')
const StandardRule = require('../../src/persistence/entities/standardRule.entity')
const StandardRuleType = require('../../src/persistence/entities/standardRuleType.entity')

const ContactDetail = require('../../src/models/contactDetail.model')
const CharityDetail = require('../../src/models/charityDetail.model')
const TaskDeterminants = require('../../src/models/taskDeterminants.model')
const DataStore = require('../../src/models/dataStore.model')
const McpBusinessType = require('../../src/models/mcpBusinessType.model')

const ApplicationCostModel = require('../../src/models/applicationCost.model')
const ApplicationCostItemModel = require('../../src/models/applicationCostItem.model')

const NeedToConsult = require('../../src/models/needToConsult.model')
const AirQualityManagementArea = require('../../src/models/airQualityManagementArea.model')
const OperatingUnder500Hours = require('../../src/models/operatingUnder500Hours.model')

// ************* Data used by exported mocks ************* //
class MockData {
  get account () {
    return {
      id: 'ACCOUNT_ID',
      companyNumber: '01234567',
      accountName: 'THE COMPANY NAME',
      isDraft: true,
      isValidatedWithCompaniesHouse: false
    }
  }

  get address () {
    return {
      id: 'ADDRESS_ID',
      uprn: 'UPRN_123456',
      fromAddressLookup: true,
      buildingNameOrNumber: '123',
      addressLine1: 'THE STREET',
      addressLine2: 'THE DISTRICT',
      townOrCity: 'TEST TOWN',
      postcode: 'BS1 5AH'
    }
  }

  get addressDetail () {
    const { address: { buildingNameOrNumber, addressLine1, addressLine2, townOrCity, postcode }, contact } = this
    return {
      id: 'ADDRESS_DETAIL_ID',
      customerId: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      type: 'ADDRESS_DETAIL_TYPE',
      email: 'ADDRESS@DETAIL.EMAIL',
      telephone: '+ 12  012 3456 7890',
      jobTitle: 'JOB_TITLE',
      fullAddress: [buildingNameOrNumber, addressLine1, addressLine2, townOrCity, postcode].join(', ')
    }
  }

  get annotation () {
    const { application } = this
    return {
      id: 'ANNOTATION_ID',
      applicationId: application.id,
      subject: 'ANNOTATION_NAME',
      filename: 'ANNOTATION_FILENAME'
    }
  }

  get application () {
    return {
      id: 'APPLICATION_ID',
      applicationNumber: 'APPLICATION_NUMBER',
      agentId: 'AGENT_ID',
      applicantType: 910400001, // organisation
      organisationType: 910400000, // limited company
      permitHolderOrganisationId: 'PERMIT_HOLDER_ORGANISATION_ID',
      confidentiality: true,
      confidentialityDetails: 'CONFIDENTIALITY DETAILS 1\nCONFIDENTIALITY DETAILS 2',
      drainageType: 910400000, // sewer
      miningWastePlan: 910400000, // water-based
      miningWasteWeight: 'one,hundred-thousand',
      tradingName: 'TRADING_NAME',
      useTradingName: true,
      relevantOffences: true,
      relevantOffencesDetails: 'RELEVANT OFFENCES DETAILS',
      bankruptcy: true,
      bankruptcyDetails: 'BANKRUPTCY DETAILS\nINSOLVENCY DETAILS',
      saveAndReturnEmail: 'SAVE@RETURN.EMAIL'
    }
  }

  get applicationAnswer () {
    return {
      questionCode: 'QUESTION_CODE',
      answerCode: 'ANSWER_CODE',
      answerDescription: 'ANSWER_DESCRIPTION',
      answerText: 'ANSWER_TEXT'
    }
  }

  get applicationCostItemModel () {
    return {
      description: 'APPLICATION_COST_ITEM_DESCRIPTION',
      cost: 234.56
    }
  }

  get applicationData () {
    const { application, data } = this
    return {
      id: 'APPLICATION_DATA_ID',
      applicationId: application.id,
      data: JSON.stringify(data)
    }
  }

  get applicationLine () {
    const { application } = this
    return {
      id: 'APPLICATION_LINE_ID',
      applicationId: application.id
    }
  }

  get applicationReturn () {
    const { application } = this
    return {
      id: 'APPLICATION_RETURN_ID',
      applicationId: application.id,
      slug: 'SLUG'
    }
  }

  get charityDetail () {
    return {
      charityPermitHolder: 'individual',
      charityName: 'CHARITY_NAME',
      charityNumber: 'CHARITY_NO'
    }
  }

  get contact () {
    return {
      id: 'CONTACT_ID',
      firstName: 'FIRSTNAME',
      lastName: 'LASTNAME'
    }
  }

  get companyData () {
    return {
      name: 'THE COMPANY NAME',
      address: 'THE COMPANY ADDRESS',
      type: 'UK_ESTABLISHMENT',
      status: 'ACTIVE',
      IsActive: true
    }
  }

  get configuration () {
    const { application } = this
    return {
      paymentReference: `WP-${application.applicationNumber}`,
      amount: '1,000.99',
      sortCode: '60-70-80',
      accountNumber: '1001 4411',
      accountName: 'EA RECEIPTS',
      ibanNumber: 'GB23NWK60708010014411',
      swiftNumber: 'NWBKGB2L',
      paymentsEmail: 'BACS@PAYMENT.EMAIL',
      description: 'THE DESCRIPTION'
    }
  }

  get configurationForMcp () {
    const { application } = this
    return {
      paymentReference: `MCP-${application.applicationNumber}`,
      amount: '1,000.99',
      sortCode: '60-70-80',
      accountNumber: '1001 4411',
      accountName: 'EA RECEIPTS',
      ibanNumber: 'GB23NWK60708010014411',
      swiftNumber: 'NWBKGB2L',
      paymentsEmail: 'BACS@PAYMENT.EMAIL',
      description: 'THE DESCRIPTION'
    }
  }

  get contactDetail () {
    const { address, addressDetail, contact } = this
    return {
      id: addressDetail.id,
      customerId: contact.id,
      addressId: address.id,
      type: addressDetail.type,
      firstName: addressDetail.firstName,
      lastName: addressDetail.lastName,
      email: addressDetail.email,
      telephone: addressDetail.telephone,
      jobTitle: addressDetail.jobTitle,
      fullAddress: addressDetail.fullAddress,
      dateOfBirth: '1999-2-4'
    }
  }

  get data () {
    return {
      permitType: Constants.PermitTypes.STANDARD_RULES.id
    }
  }

  get dataStore () {
    const { applicationData, data } = this
    return {
      id: applicationData.id,
      applicationId: applicationData.applicationId,
      data
    }
  }

  get facilityType () {
    return {
      id: 'waste',
      key: '02',
      text: 'Waste operation',
      description: 'For example, transfer stations, waste treatment, recycling and composting',
      typeText: 'waste operations',
      canApplyOnline: true
    }
  }

  get location () {
    return {
      id: 'LOCATION_ID',
      siteName: 'SITE_NAME'
    }
  }

  get locationDetail () {
    const { address } = this
    return {
      id: 'LOCATION_DETAIL_ID',
      addressId: address.id,
      gridReference: 'AB1234567890'
    }
  }

  get mcpMainBusinessTypesList () {
    return [{ code: '00.01', description: 'Main 1' }]
  }

  get mcpType () {
    return {
      id: 'stationary-mcp',
      key: '01',
      text: 'Stationary medium combustion plant (MCP)',
      isMobile: false,
      canApplyOnline: true
    }
  }

  get payment () {
    const { application, applicationLine } = this
    return {
      applicationId: application.id,
      applicationLineId: applicationLine.id,
      value: 1000.99,
      description: 'THE PAYMENT DESCRIPTION'
    }
  }

  get permitHolderType () {
    const { application } = this
    return {
      id: 'limited-company',
      type: 'Limited company',
      dynamicsApplicantTypeId: application.applicantType,
      dynamicsOrganisationTypeId: application.organisationType
    }
  }

  get standardRule () {
    return {
      id: 'STANDARD_RULE_ID',
      code: 'STANDARD_RULE_CODE',
      permitName: 'STANDARD_RULE_NAME',
      displayOrder: 1,
      selectionDisplayName: 'STANDARD_RULE_SELECTION_DISPLAY_NAME',
      standardRuleTypeId: this.standardRuleType.id,
      guidanceUrl: 'GUIDANCE_URL',
      canApplyOnline: true
    }
  }

  get standardRuleType () {
    return {
      category: 'Category',
      categoryName: 'CATEGORY_NAME',
      id: 'STANDARD_RULE_TYPE_ID'
    }
  }

  get standardRuleTypeForMcp () {
    return {
      category: 'Mcp category',
      categoryName: 'mcpd-mcp',
      id: 'STANDARD_RULE_TYPE_ID'
    }
  }

  get totalCostItemModel () {
    return {
      description: 'TOTAL_COST_ITEM_DESCRIPTION',
      cost: 1234.56
    }
  }

  get wasteActivities () {
    return []
  }

  get wasteAssessments () {
    return []
  }
}

// *************** Actual mocks exported ***************** //

class Mocks {
  constructor () {
    this.mockData = new MockData()
  }

  get account () {
    const { account } = this.mockData
    return this._account || (this._account = new Account(account))
  }

  get address () {
    const { address } = this.mockData
    return this._address || (this._address = new Address(address))
  }

  get addressDetail () {
    const { addressDetail } = this.mockData
    return this._addressDetail || (this._addressDetail = new AddressDetail(addressDetail))
  }

  get annotation () {
    const { annotation } = this.mockData
    return this._annotation || (this._annotation = new Annotation(annotation))
  }

  get application () {
    const { application } = this.mockData
    return this._application || (this._application = new Application(application))
  }

  get applicationCostModel () {
    const { applicationCostItemModel, totalCostItemModel } = this.mockData
    return this._applicationCostModel || (this._applicationCostModel =
      new ApplicationCostModel({
        applicationCostItems: [new ApplicationCostItemModel(applicationCostItemModel)],
        totalCostItem: new ApplicationCostItemModel(totalCostItemModel)
      }))
  }

  get applicationAnswer () {
    const { applicationAnswer } = this.mockData
    return this._applicationAnswer || (this._applicationAnswer = new ApplicationAnswer(applicationAnswer))
  }

  get applicationAnswers () {
    const { applicationAnswer } = this.mockData
    return this._applicationAnswers || (this._applicationAnswers = [
      new ApplicationAnswer(applicationAnswer),
      new ApplicationAnswer(applicationAnswer),
      new ApplicationAnswer(applicationAnswer),
      new ApplicationAnswer(applicationAnswer),
      new ApplicationAnswer(applicationAnswer)
    ])
  }

  get applicationData () {
    const { applicationData } = this.mockData
    return this._applicationData || (this._applicationData = new ApplicationData(applicationData))
  }

  get applicationLine () {
    const { applicationLine } = this.mockData
    return this._applicationLine || (this._applicationLine = new ApplicationLine(applicationLine))
  }

  get applicationReturn () {
    const { applicationReturn } = this.mockData
    return this._applicationReturn || (this._applicationReturn = new ApplicationReturn(applicationReturn))
  }

  get charityDetail () {
    const { charityDetail } = this.mockData
    return this._charityDetail || (this._charityDetail = new CharityDetail(charityDetail))
  }

  get companyData () {
    const { companyData } = this.mockData
    return this._companyData || (this._companyData = Object.assign({}, companyData))
  }

  get configuration () {
    const { configuration } = this.mockData
    return this._configuration || (this._configuration = new Configuration(configuration))
  }

  get configurationForMcp () {
    const { configurationForMcp } = this.mockData
    return this._configurationForMcp || (this._configurationForMcp = new Configuration(configurationForMcp))
  }

  get contact () {
    const { contact } = this.mockData
    return this._contact || (this._contact = new Contact(contact))
  }

  get contactDetail () {
    const { contactDetail } = this.mockData
    return this._contactDetail || (this._contactDetail = new ContactDetail(contactDetail))
  }

  get context () {
    if (!this._context) {
      const account = this.account
      const application = this.application
      const applicationLine = this.applicationLine
      const applicationReturn = this.applicationReturn
      const dataStore = this.dataStore
      const standardRule = this.standardRule
      const permitHolderType = this.permitHolderType
      const taskDeterminants = this.taskDeterminants
      this._context = {
        account,
        applicationId: application.id,
        applicationLineId: applicationLine.id,
        standardRuleId: standardRule.id,
        standardRuleTypeId: standardRule.standardRuleTypeId,
        application,
        applicationLine,
        applicationReturn,
        dataStore,
        permitHolderType,
        standardRule,
        taskDeterminants,
        permitType: Constants.PermitTypes.STANDARD_RULES.id,
        isBespoke: false
      }
    }
    return this._context
  }

  get dataStore () {
    const { dataStore } = this.mockData
    return this._dataStore || (this._dataStore = new DataStore(dataStore))
  }

  get location () {
    const { location } = this.mockData
    return this._location || (this._location = new Location(location))
  }

  get locationDetail () {
    const { locationDetail } = this.mockData
    return this._locationDetail || (this._locationDetail = new LocationDetail(locationDetail))
  }

  get mcpBusinessType () {
    return this._mcpBusinessType || (this._mcpBusinessType = new McpBusinessType())
  }

  get mcpMainBusinessTypesList () {
    const { mcpMainBusinessTypesList } = this.mockData
    return this._mcpMainBusinessTypesList || (this._mcpMainBusinessTypesList = mcpMainBusinessTypesList.map((item) => Object.assign({}, item)))
  }

  get needToConsult () {
    return this._needToConsult || (this._needToConsult = new NeedToConsult())
  }

  get airQualityManagementArea () {
    return this._airQualityManagementArea || (this._airQualityManagementArea = new AirQualityManagementArea())
  }

  get operatingUnder500Hours () {
    return this._operatingUnder500Hours || (this._operatingUnder500Hours = new OperatingUnder500Hours())
  }

  get payment () {
    const { payment } = this.mockData
    return this._payment || (this._payment = new Payment(payment))
  }

  get permitHolderType () {
    const { permitHolderType } = this.mockData
    if (!this._permitHolderType) {
      this._permitHolderType = Object.assign({}, permitHolderType)
    }
    return this._permitHolderType
  }

  get recovery () {
    if (!this._recovery) {
      this._recovery = this.context
    }
    return this._recovery
  }

  get request () {
    return {
      app: {
        data: this.context
      }
    }
  }

  get standardRule () {
    const { standardRule } = this.mockData
    return this._standardRule || (this._standardRule = new StandardRule(standardRule))
  }

  get standardRuleType () {
    const { standardRuleType } = this.mockData
    return this._standardRuleType || (this._standardRuleType = new StandardRuleType(standardRuleType))
  }

  get standardRuleTypeForMcp () {
    const { standardRuleTypeForMcp } = this.mockData
    return this._standardRuleTypeForMcp || (this._standardRuleTypeForMcp = new StandardRuleType(standardRuleTypeForMcp))
  }

  get taskDeterminants () {
    const { mcpType, facilityType, wasteActivities, wasteAssessments } = this.mockData
    const permitType = Constants.PermitTypes.STANDARD_RULES
    return this._taskDeterminants || (this._taskDeterminants = new TaskDeterminants({ context: {}, mcpType, permitType, facilityType, wasteActivities, wasteAssessments }))
  }

  get wasteActivities () {
    const { wasteActivities } = this.mockData
    return this._wasteActivities || (this._wasteActivities = [...wasteActivities])
  }

  get wasteAssessments () {
    const { wasteAssessments } = this.mockData
    return this._wasteAssessments || (this._wasteAssessments = [...wasteAssessments])
  }
}

// Export the mocks

module.exports = Mocks
