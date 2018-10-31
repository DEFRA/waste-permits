'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const CryptoService = require('../../../src/services/crypto.service')
const Application = require('../../../src/persistence/entities/application.entity')
const ContactDetail = require('../../../src/models/contactDetail.model')
const ApplicationLine = require('../../../src/persistence/entities/applicationLine.entity')
const Account = require('../../../src/persistence/entities/account.entity')
const Contact = require('../../../src/persistence/entities/contact.entity')
const Address = require('../../../src/persistence/entities/address.entity')
const PublicBodyDetails = require('../../../src/models/taskList/publicBodyDetails.task')

let sandbox

let fakeApplication
let fakeApplicationLine
let fakeContactDetail
let fakeAccount
let fakeContact
let fakeAddress

const request = {
  app: {
    data: {
      authToken: 'AUTH_TOKEN'
    }
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

  fakeApplication = {
    id: 'APPLICATION_ID',
    isIndividual: true
  }

  fakeApplicationLine = {
    id: 'APPLICATION_LINE_ID',
    applicationId: fakeApplication.id
  }

  fakeContactDetail = {
    id: 'CONTACT_DETAIL_ID',
    addressId: 'ADDRESS_ID_1',
    applicationId: fakeApplication.id
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
  sandbox.stub(CryptoService, 'decrypt').value(() => fakeContactDetail.id)
  sandbox.stub(ContactDetail, 'get').value(() => new ContactDetail(fakeContactDetail))
  sandbox.stub(ContactDetail.prototype, 'save').value(() => undefined)
  sandbox.stub(Application, 'getById').value(() => fakeApplication)
  sandbox.stub(ApplicationLine, 'getById').value(() => fakeApplicationLine)
  sandbox.stub(Account, 'getById').value(() => new Account(fakeAccount))
  sandbox.stub(Account.prototype, 'save').value(() => undefined)
  sandbox.stub(Contact, 'getById').value(() => new Contact(fakeContact))
  sandbox.stub(Address.prototype, 'save').value(() => undefined)
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
    const address = await PublicBodyDetails.getAddress(request, applicationId)
    Code.expect(address.uprn).to.be.equal(fakeAddress.uprn)
  })

  lab.test('saveSelectedAddress() method correctly saves a public body address', async () => {
    const addressDto = {
      uprn: fakeAddress.uprn,
      postcode: fakeAddress.postcode
    }
    const spy = sinon.spy(ContactDetail.prototype, 'save')
    await PublicBodyDetails.saveSelectedAddress(request, applicationId, applicationLineId, addressDto)
    Code.expect(spy.callCount).to.equal(1)
    spy.restore()
  })

  lab.test('saveManualAddress() method correctly creates a public body address from a selected address that is already in Dynamics', async () => {
    const addressDto = {
      uprn: fakeAddress.uprn,
      postcode: fakeAddress.postcode
    }
    const spy = sinon.spy(ContactDetail.prototype, 'save')
    await PublicBodyDetails.saveManualAddress(request, applicationId, applicationLineId, addressDto)
    Code.expect(spy.callCount).to.equal(1)
    spy.restore()
  })
})
