'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Application = require('../../../src/persistence/entities/application.entity')
const ApplicationLine = require('../../../src/persistence/entities/applicationLine.entity')
const Account = require('../../../src/persistence/entities/account.entity')
const Address = require('../../../src/persistence/entities/address.entity')
const ContactDetail = require('../../../src/models/contactDetail.model')
const PermitHolderDetails = require('../../../src/models/taskList/permitHolderDetails.task')

const COMPLETENESS_PARAMETER = 'defra_pholderdetailsrequired_completed'

let sandbox
let fakeApplication
let fakeApplicationLine
let fakeAccount
let fakeContactDetail
let fakeAddress

const request = { app: { data: { authToken: 'AUTH_TOKEN' } } }
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
    applicationId: fakeApplication.id,
    firstName: 'FIRSTNAME',
    lastName: 'LASTNAME',
    email: 'EMAIL',
    telephone: 'TELEPHONE'
  }

  fakeAddress = {
    id: 'ADDRESS_ID',
    buildingNameOrNumber: '101',
    addressLine1: 'FIRST_ADDRESS_LINE',
    addressLine2: undefined,
    townOrCity: 'CITY',
    postcode: 'AB12 1AA',
    uprn: 'UPRN',
    fromAddressLookup: true
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(ContactDetail.prototype, 'save').value(() => fakeAddress.id)
  sandbox.stub(Application, 'getById').value(() => fakeApplication)
  sandbox.stub(ApplicationLine, 'getById').value(() => fakeApplicationLine)
  sandbox.stub(Account, 'getById').value(() => new Account(fakeAccount))
  sandbox.stub(Account.prototype, 'save').value(() => undefined)
  sandbox.stub(ContactDetail, 'get').value(() => new ContactDetail(fakeContactDetail))
  sandbox.stub(ContactDetail.prototype, 'save').value(() => undefined)
  sandbox.stub(Address, 'getById').value(() => new Address(fakeAddress))
  sandbox.stub(Address, 'getByUprn').value(() => new Address(fakeAddress))
  sandbox.stub(Address, 'listByPostcode').value(() => [
    new Address(fakeAddress),
    new Address(fakeAddress),
    new Address(fakeAddress)
  ])
  sandbox.stub(Address.prototype, 'save').value(() => undefined)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const testCompleteness = async (expectedResult) => {
  const result = await PermitHolderDetails.checkComplete()
  Code.expect(result).to.equal(expectedResult)
}

lab.experiment('Model persistence methods:', () => {
  lab.test('getAddress() method correctly retrieves an Address', async () => {
    const address = await PermitHolderDetails.getAddress(request, applicationId)
    Code.expect(address.uprn).to.be.equal(fakeAddress.uprn)
  })

  lab.test('saveSelectedAddress() method correctly saves a permit holder address', async () => {
    const addressDto = {
      uprn: fakeAddress.uprn,
      postcode: fakeAddress.postcode
    }
    const spy = sinon.spy(ContactDetail.prototype, 'save')
    await PermitHolderDetails.saveSelectedAddress(request, applicationId, applicationLineId, addressDto)
    Code.expect(spy.callCount).to.equal(1)
    spy.restore()
  })

  lab.test('saveManualAddress() method correctly creates a permit holder address from a selected address', async () => {
    const addressDto = {
      uprn: fakeAddress.uprn,
      postcode: fakeAddress.postcode
    }
    const spy = sinon.spy(ContactDetail.prototype, 'save')
    await PermitHolderDetails.saveManualAddress(request, applicationId, applicationLineId, addressDto)
    Code.expect(spy.callCount).to.equal(1)
    spy.restore()
  })
})

lab.experiment('Task List: Permit Holder Details Model tests:', () => {
  lab.test(`completenessParameter is ${COMPLETENESS_PARAMETER}`, async () => {
    Code.expect(PermitHolderDetails.completenessParameter).to.equal(COMPLETENESS_PARAMETER)
  })

  lab.test('isComplete() method correctly returns TRUE when the task list item is complete for a company', async () => {
    fakeApplication.isIndividual = false
    testCompleteness(true)
  })

  lab.test('isComplete() method correctly returns TRUE when the task list item is complete for an individual', async () => {
    fakeApplication.isIndividual = true
    testCompleteness(true)
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete for a company', async () => {
    fakeApplication.isIndividual = false
    fakeAccount.accountName = undefined
    testCompleteness(false)
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete for an individual', async () => {
    fakeApplication.isIndividual = true
    fakeContactDetail.firstName = undefined
    testCompleteness(false)
  })
})
