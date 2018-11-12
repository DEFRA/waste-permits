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

const account = {
  id: 'ACCOUNT_ID',
  companyNumber: '01234567',
  accountName: 'THE COMPANY NAME',
  isDraft: true,
  isValidatedWithCompaniesHouse: false
}

const address = {
  id: 'ADDRESS_ID',
  uprn: 'UPRN_123456',
  fromAddressLookup: true,
  buildingNameOrNumber: '123',
  addressLine1: 'THE STREET',
  addressLine2: 'THE DISTRICT',
  townOrCity: 'TEST TOWN',
  postcode: 'BS1 5AH'
}

const annotation = {
  id: 'ANNOTATION_ID',
  subject: 'ANNOTATION_NAME',
  filename: 'ANNOTATION_FILENAME'
}

const application = {
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

const applicationLine = {
  id: 'APPLICATION_LINE_ID',
  applicationId: application.id
}

const data = {
  foo: 'bar'
}

const applicationData = {
  id: 'APPLICATION_DATA_ID',
  applicationId: application.id,
  data: JSON.stringify(data)
}

const applicationReturn = {
  id: 'APPLICATION_RETURN_ID',
  applicationId: application.id,
  slug: 'SLUG'
}

const contact = {
  id: 'CONTACT_ID',
  firstName: 'FIRSTNAME',
  lastName: 'LASTNAME'
}

const addressDetail = {
  id: 'ADDRESS_DETAIL_ID',
  customerId: contact.id,
  firstName: contact.firstName,
  lastName: contact.lastName,
  type: 'ADDRESS_DETAIL_TYPE',
  email: 'EMAIL',
  telephone: 'TELEPHONE',
  jobTitle: 'JOB_TITLE'
}

const contactDetail = {
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

const dataStore = {
  id: applicationData.id,
  applicationId: applicationData.applicationId,
  data
}

const location = {
  id: 'LOCATION_ID',
  siteName: 'SITE_NAME'
}

const locationDetail = {
  id: 'LOCATION_DETAIL_ID',
  addressId: address.id,
  gridReference: 'GRID_REFERENCE'
}

const permitHolderType = {
  type: 'Limited company'
}

const standardRule = {
  code: 'STANDARD_RULE_CODE',
  permitName: 'STANDARD_RULE_NAME'
}

const applicationCostItemModel = {
  description: 'APPLICATION_COST_ITEM_DESCRIPTION',
  cost: 1234.56
}
const totalCostItemModel = {
  description: 'TOTAL_COST_ITEM_DESCRIPTION',
  cost: 1234.56
}

module.exports = class Mocks {
  get account () {
    return this._account || (this._account = new Account(account))
  }

  get address () {
    return this._address || (this._address = new Address(address))
  }

  get addressDetail () {
    return this._addressDetail || (this._addressDetail = new AddressDetail(addressDetail))
  }

  get application () {
    return this._application || (this._application = new Application(application))
  }

  get annotation () {
    return this._annotation || (this._annotation = new Annotation(annotation))
  }

  get applicationLine () {
    return this._applicationLine || (this._applicationLine = new ApplicationLine(applicationLine))
  }

  get applicationData () {
    return this._applicationData || (this._applicationData = new ApplicationData(applicationData))
  }

  get applicationReturn () {
    return this._applicationReturn || (this._applicationReturn = new ApplicationReturn(applicationReturn))
  }

  get contact () {
    return this._contact || (this._contact = new Contact(contact))
  }

  get contactDetail () {
    return this._contactDetail || (this._contactDetail = new ContactDetail(contactDetail))
  }

  get dataStore () {
    return this._dataStore || (this._dataStore = new DataStore(dataStore))
  }

  get location () {
    return this._location || (this._location = new Location(location))
  }

  get locationDetail () {
    return this._locationDetail || (this._locationDetail = new LocationDetail(locationDetail))
  }

  get recovery () {
    return {
      authToken: 'AUTH_TOKEN',
      applicationId: this.application.id,
      applicationLineId: this.applicationLine.id,
      application: this.application
    }
  }

  get standardRule () {
    return this._standardRule || (this._standardRule = new StandardRule(standardRule))
  }

  get permitHolderType () {
    if (!this._permitHolderType) {
      this._permitHolderType = Object.assign({}, permitHolderType)
    }
    return this._permitHolderType
  }

  get applicationCostModel () {
    return this._applicationCostModel || (this._applicationCostModel =
      new ApplicationCostModel({
        applicationCostItems: [new ApplicationCostItemModel(applicationCostItemModel)],
        totalCostItem: new ApplicationCostItemModel(totalCostItemModel)
      }))
  }
}
