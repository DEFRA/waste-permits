'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const DynamicsDalService = require('../../../src/services/dynamicsDal.service')
const Application = require('../../../src/models/application.model')
const ApplicationLine = require('../../../src/models/applicationLine.model')
const Account = require('../../../src/models/account.model')
const Contact = require('../../../src/models/contact.model')
const Address = require('../../../src/models/address.model')
const AddressDetail = require('../../../src/models/addressDetail.model')
const PermitHolderDetails = require('../../../src/models/taskList/permitHolderDetails.model')

const COMPLETENESS_PARAMETER = 'defra_pholderdetailsrequired_completed'

let sandbox
let fakeApplication
let fakeApplicationLine
let fakeAccount
let fakeContact
let fakeAddressDetails
let fakeAddress1
let fakeAddress2
let fakeAddress3

const request = {app: {data: {authToken: 'AUTH_TOKEN'}}}
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

  fakeAddress1 = {
    id: 'ADDRESS_ID_1',
    buildingNameOrNumber: '101',
    addressLine1: 'FIRST_ADDRESS_LINE_1',
    addressLine2: undefined,
    townOrCity: 'CITY1',
    postcode: 'AB12 1AA',
    uprn: 'UPRN1',
    fromAddressLookup: true
  }

  fakeAddress2 = {
    id: 'ADDRESS_ID_2',
    buildingNameOrNumber: '102',
    addressLine1: 'SECOND_ADDRESS_LINE_1',
    addressLine2: undefined,
    townOrCity: 'CITY2',
    postcode: 'AB12 2AA',
    uprn: 'UPRN2',
    fromAddressLookup: true
  }

  fakeAddress3 = {
    id: 'ADDRESS_ID_3',
    buildingNameOrNumber: '103',
    addressLine1: 'THIRD_ADDRESS_LINE_1',
    addressLine2: undefined,
    townOrCity: 'CITY3',
    postcode: 'AB12 3AA',
    uprn: 'UPRN3',
    fromAddressLookup: true
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(DynamicsDalService.prototype, 'create').value(() => fakeAddress1.id)
  sandbox.stub(DynamicsDalService.prototype, 'update').value((dataObject) => dataObject.id)
  sandbox.stub(Application, 'getById').value(() => fakeApplication)
  sandbox.stub(ApplicationLine, 'getById').value(() => fakeApplicationLine)
  sandbox.stub(Account, 'getById').value(() => new Account(fakeAccount))
  sandbox.stub(Account.prototype, 'save').value(() => {})
  sandbox.stub(Contact, 'getById').value(() => new Contact(fakeContact))
  sandbox.stub(AddressDetail, 'getIndividualPermitHolderDetails').value(() => new AddressDetail(fakeAddressDetails))
  sandbox.stub(AddressDetail, 'getByApplicationIdAndType').value(() => new AddressDetail({ addressId: 'ADDRESS_ID' }))
  sandbox.stub(Address, 'getById').value(() => new Address(fakeAddress1))
  sandbox.stub(Address, 'getByUprn').value(() => new Address(fakeAddress1))
  sandbox.stub(Address, 'listByPostcode').value(() => [
    new Address(fakeAddress1),
    new Address(fakeAddress2),
    new Address(fakeAddress3)
  ])
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
    Code.expect(address.uprn).to.be.equal(fakeAddress1.uprn)
  })

  lab.test('saveSelectedAddress() method correctly saves an invoice address that is already in Dynamics', async () => {
    const addressDto = {
      uprn: fakeAddress1.uprn,
      postcode: fakeAddress1.postcode
    }
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await PermitHolderDetails.saveSelectedAddress(request, applicationId, applicationLineId, addressDto)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('saveSelectedAddress() method correctly saves an invoice address that is not already in Dynamics', async () => {
    Address.getByUprn = () => undefined
    const addressDto = {
      uprn: fakeAddress1.uprn,
      postcode: fakeAddress1.postcode
    }
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await PermitHolderDetails.saveSelectedAddress(request, applicationId, applicationLineId, addressDto)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('saveManualAddress() method correctly creates an invoice address from a selected address that is already in Dynamics', async () => {
    const addressDto = {
      uprn: fakeAddress1.uprn,
      postcode: fakeAddress1.postcode
    }
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await PermitHolderDetails.saveManualAddress(request, applicationId, applicationLineId, addressDto)
    Code.expect(spy.callCount).to.equal(2)
  })

  lab.test('saveManualAddress() method correctly saves an invoice address that is not already in Dynamics', async () => {
    Address.getByUprn = () => undefined
    const addressDto = {
      postcode: fakeAddress1.postcode
    }
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await PermitHolderDetails.saveManualAddress(request, applicationId, applicationLineId, addressDto)
    Code.expect(spy.callCount).to.equal(2)
  })
})

lab.experiment('Task List: Permit Holder Details Model tests:', () => {
  lab.test(`completenessParameter is ${COMPLETENESS_PARAMETER}`, async () => {
    Code.expect(PermitHolderDetails.completenessParameter).to.equal(COMPLETENESS_PARAMETER)
  })

  lab.test('isComplete() method correctly returns TRUE when the task list item is complete for a company', async () => {
    fakeApplication.isIndividual = false
    fakeApplication.permitHolderOrganisationId = fakeAccount.id
    testCompleteness(true)
  })

  lab.test('isComplete() method correctly returns TRUE when the task list item is complete for an individual', async () => {
    fakeApplication.isIndividual = true
    fakeApplication.permitHolderIndividualId = fakeContact.id
    testCompleteness(true)
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete for a company', async () => {
    fakeApplication.isIndividual = false
    fakeApplication.permitHolderOrganisationId = fakeAccount.id
    fakeAccount.accountName = undefined
    testCompleteness(false)
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete for an individual', async () => {
    fakeApplication.isIndividual = true
    fakeApplication.permitHolderIndividualId = fakeContact.id
    fakeContact.firstName = undefined
    testCompleteness(false)
  })
})
