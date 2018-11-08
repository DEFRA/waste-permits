const Account = require('../../src/persistence/entities/account.entity')
const Address = require('../../src/persistence/entities/address.entity')
const AddressDetail = require('../../src/persistence/entities/addressDetail.entity')
const Application = require('../../src/persistence/entities/application.entity')
const Annotation = require('../../src/persistence/entities/annotation.entity')
const ApplicationLine = require('../../src/persistence/entities/applicationLine.entity')
const Contact = require('../../src/persistence/entities/contact.entity')
const Location = require('../../src/persistence/entities/location.entity')
const LocationDetail = require('../../src/persistence/entities/locationDetail.entity')
const StandardRule = require('../../src/persistence/entities/standardRule.entity')

const ContactDetail = require('../../src/models/contactDetail.model')

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
  bankruptcyDetails: 'BANKRUPTCY DETAILS\nINSOLVENCY DETAILS'
}

const applicationLine = {
  id: 'APPLICATION_LINE_ID',
  applicationId: application.id
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

const location = {
  siteName: 'SITE_NAME'
}

const locationDetail = {
  gridReference: 'GRID_REFERENCE'
}

const permitHolderType = {
  type: 'Limited company'
}

const standardRule = {
  code: 'STANDARD_RULE_CODE',
  permitName: 'STANDARD_RULE_NAME'
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

  get contact () {
    return this._contact || (this._contact = new Contact(contact))
  }

  get contactDetail () {
    return this._contactDetail || (this._contactDetail = new ContactDetail(contactDetail))
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
}
