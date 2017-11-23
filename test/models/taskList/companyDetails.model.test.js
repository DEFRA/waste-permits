'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const DynamicsDalService = require('../../../src/services/dynamicsDal.service')
const ApplicationLine = require('../../../src/models/applicationLine.model')
const Account = require('../../../src/models/account.model')
const CompanyDetails = require('../../../src/models/taskList/companyDetails.model')

let dynamicsUpdateStub
let applicationLineGetByIdStub
let accountGetByApplicationIdStub
let accountSaveStub

const fakeApplicationLine = {
  id: 'ca6b60f0-c1bf-e711-8111-5065f38adb81',
  applicationId: 'c1ae11ee-c1bf-e711-810e-5065f38bb461'
}

const fakeAccount = {
  id: 'ACCOUNT_ID',
  companyNumber: '01234567',
  name: 'THE COMPANY NAME',
  isDraft: true,
  isValidatedWithCompaniesHouse: false
}

const authToken = 'THE_AUTH_TOKEN'
const applicationId = fakeApplicationLine.applicationId
const applicationLineId = fakeApplicationLine.id

lab.beforeEach(() => {
  // Stub methods

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = (dataObject) => dataObject.id

  applicationLineGetByIdStub = ApplicationLine.getById
  ApplicationLine.getById = () => fakeApplicationLine

  accountGetByApplicationIdStub = Account.getByApplicationId
  Account.getByApplicationId = () => {
    return new Account(fakeAccount)
  }

  accountSaveStub = Account.prototype.save
  Account.prototype.save = () => {}
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.update = dynamicsUpdateStub
  ApplicationLine.getById = applicationLineGetByIdStub
  Account.getByApplicationId = accountGetByApplicationIdStub
  Account.prototype.save = accountSaveStub
})

const testCompleteness = async (obj, expectedResult) => {
  fakeAccount.name = obj.name
  const result = await CompanyDetails._isComplete(authToken, applicationId)
  Code.expect(result).to.equal(expectedResult)
}

lab.experiment('Task List: Company Details Model tests:', () => {
  lab.test('updateCompleteness() method updates the task list item completeness', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    await CompanyDetails.updateCompleteness(authToken, applicationId, applicationLineId)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('isComplete() method correctly returns TRUE when the task list item is complete', async () => {
    await testCompleteness({
      companyName: 'THE COMPANY NAME'
    }, true)
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete', async () => {
    await testCompleteness({
      companyName: undefined
    }, false)

    await testCompleteness({
      companyName: ''
    }, false)
  })
})
