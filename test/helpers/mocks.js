const Constants = require('../../src/constants')

const Account = require('../../src/persistence/entities/account.entity')
const Address = require('../../src/persistence/entities/address.entity')
const AddressDetail = require('../../src/persistence/entities/addressDetail.entity')
const Application = require('../../src/persistence/entities/application.entity')
const Annotation = require('../../src/persistence/entities/annotation.entity')
const ApplicationData = require('../../src/persistence/entities/applicationData.entity')
const ApplicationLine = require('../../src/persistence/entities/applicationLine.entity')
const ApplicationReturn = require('../../src/persistence/entities/applicationReturn.entity')
const Contact = require('../../src/persistence/entities/contact.entity')
const Location = require('../../src/persistence/entities/location.entity')
const LocationDetail = require('../../src/persistence/entities/locationDetail.entity')
const StandardRule = require('../../src/persistence/entities/standardRule.entity')

const ContactDetail = require('../../src/models/contactDetail.model')
const DataStore = require('../../src/models/dataStore.model')

const ApplicationCostModel = require('../../src/models/triage/applicationCost.model')
const ApplicationCostItemModel = require('../../src/models/triage/applicationCostItem.model')

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
    const { contact } = this
    return {
      id: 'ADDRESS_DETAIL_ID',
      customerId: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      type: 'ADDRESS_DETAIL_TYPE',
      email: 'EMAIL',
      telephone: 'TELEPHONE',
      jobTitle: 'JOB_TITLE'
    }
  }

  get annotation () {
    return {
      id: 'ANNOTATION_ID',
      subject: 'ANNOTATION_NAME',
      filename: 'ANNOTATION_FILENAME'
    }
  }

  get application () {
    return {
      id: 'APPLICATION_ID',
      applicationNumber: 'APPLICATION_NUMBER',
      organisationType: 'ORGANISATION_TYPE',
      confidentiality: true,
      confidentialityDetails: 'CONFIDENTIALITY DETAILS 1\nCONFIDENTIALITY DETAILS 2',
      drainageType: 910400000,
      miningWastePlan: 910400000,
      miningWasteWeight: 'one,hundred-thousand',
      tradingName: 'TRADING_NAME',
      useTradingName: true,
      relevantOffences: true,
      relevantOffencesDetails: 'CONVICTION DETAILS 1\nCONVICTION DETAILS 2',
      bankruptcy: true,
      bankruptcyDetails: 'BANKRUPTCY DETAILS\nINSOLVENCY DETAILS',
      saveAndReturnEmail: 'SAVE@RETURN.EMAIL'
    }
  }

  get applicationCostItemModel () {
    return {
      description: 'APPLICATION_COST_ITEM_DESCRIPTION',
      cost: 1234.56
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

  get contact () {
    return {
      id: 'CONTACT_ID',
      firstName: 'FIRSTNAME',
      lastName: 'LASTNAME'
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
      dateOfBirth: '2018-2-4'
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
      gridReference: 'GRID_REFERENCE'
    }
  }

  get permitHolderType () {
    return {
      type: 'Limited company'
    }
  }

  get standardRule () {
    return {
      code: 'STANDARD_RULE_CODE',
      permitName: 'STANDARD_RULE_NAME'
    }
  }

  get totalCostItemModel () {
    return {
      description: 'TOTAL_COST_ITEM_DESCRIPTION',
      cost: 1234.56
    }
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

  get contact () {
    const { contact } = this.mockData
    return this._contact || (this._contact = new Contact(contact))
  }

  get contactDetail () {
    const { contactDetail } = this.mockData
    return this._contactDetail || (this._contactDetail = new ContactDetail(contactDetail))
  }

  get context () {
    const application = this.application
    const applicationLine = this.applicationLine
    return {
      authToken: 'AUTH_TOKEN',
      applicationId: application.id,
      applicationLineId: applicationLine.id,
      application,
      applicationLine
    }
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

  get permitHolderType () {
    const { permitHolderType } = this.mockData
    if (!this._permitHolderType) {
      this._permitHolderType = Object.assign({}, permitHolderType)
    }
    return this._permitHolderType
  }

  get recovery () {
    return {
      authToken: 'AUTH_TOKEN',
      applicationId: this.application.id,
      applicationLineId: this.applicationLine.id,
      application: this.application
    }
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
}

// Export the mocks

module.exports = Mocks
