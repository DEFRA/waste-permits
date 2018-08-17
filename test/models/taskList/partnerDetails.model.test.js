'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const DynamicsDalService = require('../../../src/services/dynamicsDal.service')
const CryptoService = require('../../../src/services/crypto.service')
const Application = require('../../../src/models/application.model')
const ApplicationContact = require('../../../src/models/applicationContact.model')
const ApplicationLine = require('../../../src/models/applicationLine.model')
const Account = require('../../../src/models/account.model')
const Contact = require('../../../src/models/contact.model')
const Address = require('../../../src/models/address.model')
const AddressDetail = require('../../../src/models/addressDetail.model')
const PartnerDetails = require('../../../src/models/taskList/partnerDetails.model')

let sandbox
let fakePartnershipId = 'PARTNERSHIP_ID'

let fakeApplication
let fakeApplicationLine
let fakeApplicationContact
let fakeAccount
let fakeContact
let fakeAddressDetails
let fakeAddress

const request = {
  app: {
    data: {
      authToken: 'AUTH_TOKEN'
    }
  },
  params: {
    partnerId: fakePartnershipId
  }
}
const applicationId = 'APPLICATION_ID'
const applicationLineId = 'APPLICATION_LINE_ID'

lab.beforeEach(() => {
  fakeAccount = {
    id: 'ACCOUNT_ID',
    companyNumber: '01234567',
    accountName: 'THE COMPANY NAME',
    isDraft: true,
    isValidatedWithCompaniesHouse: false
  }

  fakeContact = {
    id: 'CONTACT_ID',
    firstName: 'FIRSTNAME',
    lastName: 'LASTNAME',
    email: 'EMAIL'
  }

  fakeAddressDetails = {
    addressId: 'ADDRESS-ID',
    dateOfBirth: 'DATE-OF-BIRTH',
    telephone: '0123456789'
  }

  fakeApplication = {
    id: 'APPLICATION_ID',
    isIndividual: true
  }

  fakeApplicationLine = {
    id: 'APPLICATION_LINE_ID',
    applicationId: fakeApplication.id
  }

  fakeApplicationContact = {
    id: 'APPLICATION_CONTACT_ID',
    applicationId: fakeApplication.id,
    contactId: fakeContact.id
  }

  fakeAddress = {
    id: 'ADDRESS_ID_1',
    buildingNameOrNumber: '101',
    addressLine1: 'FIRST_ADDRESS_LINE_1',
    addressLine2: undefined,
    townOrCity: 'CITY1',
    postcode: 'AB12 1AA',
    uprn: 'UPRN1',
    fromAddressLookup: true
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(DynamicsDalService.prototype, 'create').value(() => fakeAddress.id)
  sandbox.stub(DynamicsDalService.prototype, 'update').value((dataObject) => dataObject.id)
  sandbox.stub(CryptoService, 'decrypt').value(() => fakeApplicationContact.id)
  sandbox.stub(Application, 'getById').value(() => fakeApplication)
  sandbox.stub(ApplicationLine, 'getById').value(() => fakeApplicationLine)
  sandbox.stub(ApplicationContact, 'getById').value(() => new ApplicationContact(fakeApplicationContact))
  sandbox.stub(Account, 'getById').value(() => new Account(fakeAccount))
  sandbox.stub(Account.prototype, 'save').value(() => {})
  sandbox.stub(Contact, 'getById').value(() => new Contact(fakeContact))
  sandbox.stub(AddressDetail, 'getById').value(() => new AddressDetail(fakeAddressDetails))
  sandbox.stub(AddressDetail, 'getPartnerDetails').value(() => new AddressDetail(fakeAddressDetails))
  sandbox.stub(Address, 'getById').value(() => new Address(fakeAddress))
  sandbox.stub(Address, 'getByUprn').value(() => new Address(fakeAddress))
  sandbox.stub(Address, 'listByPostcode').value(() => [
    new Address(fakeAddress),
    new Address(fakeAddress),
    new Address(fakeAddress)
  ])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Model persistence methods:', () => {
  lab.test('getAddress() method correctly retrieves an Address', async () => {
    const address = await PartnerDetails.getAddress(request, applicationId)
    Code.expect(address.uprn).to.be.equal(fakeAddress.uprn)
  })

  lab.test('saveSelectedAddress() method correctly saves an invoice address that is already in Dynamics', async () => {
    const addressDto = {
      uprn: fakeAddress.uprn,
      postcode: fakeAddress.postcode
    }
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await PartnerDetails.saveSelectedAddress(request, applicationId, applicationLineId, addressDto)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('saveSelectedAddress() method correctly saves an invoice address that is not already in Dynamics', async () => {
    Address.getByUprn = () => undefined
    const addressDto = {
      uprn: fakeAddress.uprn,
      postcode: fakeAddress.postcode
    }
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await PartnerDetails.saveSelectedAddress(request, applicationId, applicationLineId, addressDto)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('saveManualAddress() method correctly creates an invoice address from a selected address that is already in Dynamics', async () => {
    const addressDto = {
      uprn: fakeAddress.uprn,
      postcode: fakeAddress.postcode
    }
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await PartnerDetails.saveManualAddress(request, applicationId, applicationLineId, addressDto)
    Code.expect(spy.callCount).to.equal(2)
  })

  lab.test('saveManualAddress() method correctly saves an invoice address that is not already in Dynamics', async () => {
    Address.getByUprn = () => undefined
    const addressDto = {
      postcode: fakeAddress.postcode
    }
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await PartnerDetails.saveManualAddress(request, applicationId, applicationLineId, addressDto)
    Code.expect(spy.callCount).to.equal(2)
  })
})
