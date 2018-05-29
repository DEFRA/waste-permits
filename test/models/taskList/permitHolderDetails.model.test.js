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
const AddressDetail = require('../../../src/models/addressDetail.model')
const PermitHolderDetails = require('../../../src/models/taskList/permitHolderDetails.model')

let sandbox
let fakeApplication
let fakeApplicationLine
let fakeAccount
let fakeContact
let fakeAddressDetails

const authToken = 'THE_AUTH_TOKEN'

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
    lastName: 'LASTNAME'
  }

  fakeAddressDetails = {
    dateOfBirth: 'DATE-OF-BIRTH'
  }

  fakeApplication = {
    id: 'APPLICATION_ID',
    isIndividual: true
  }

  fakeApplicationLine = {
    id: 'APPLICATION_LINE_ID',
    applicationId: fakeApplication.id
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(DynamicsDalService.prototype, 'update').value((dataObject) => dataObject.id)
  sandbox.stub(Application, 'getById').value(() => fakeApplication)
  sandbox.stub(ApplicationLine, 'getById').value(() => fakeApplicationLine)
  sandbox.stub(Account, 'getById').value(() => new Account(fakeAccount))
  sandbox.stub(Account.prototype, 'save').value(() => {})
  sandbox.stub(Contact, 'getById').value(() => new Contact(fakeContact))
  sandbox.stub(AddressDetail, 'getIndividualPermitHolderDetails').value(() => new AddressDetail(fakeAddressDetails))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const testCompleteness = async (expectedResult) => {
  const result = await PermitHolderDetails.isComplete(authToken, fakeApplication.id)
  Code.expect(result).to.equal(expectedResult)
}

lab.experiment('Task List: Permit Holder Details Model tests:', () => {
  lab.test('updateCompleteness() method updates the task list item completeness', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    await PermitHolderDetails.updateCompleteness(authToken, fakeApplication.id, fakeApplicationLine.id)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('isComplete() method correctly returns TRUE when the task list item is complete for a company', async () => {
    fakeApplication.isIndividual = false
    fakeApplication.accountId = fakeAccount.id
    testCompleteness(true)
  })

  lab.test('isComplete() method correctly returns TRUE when the task list item is complete for an individual', async () => {
    fakeApplication.isIndividual = true
    fakeApplication.permitHolderIndividualId = fakeContact.id
    testCompleteness(true)
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete for a company', async () => {
    fakeApplication.isIndividual = false
    fakeApplication.accountId = fakeAccount.id
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
