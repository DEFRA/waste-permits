'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Account = require('../../src/models/account.model')
const Application = require('../../src/models/application.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let dynamicsCreateStub
let dynamicsSearchStub
let dynamicsUpdateStub
let applicationGetByIdStub

let testAccount
const fakeAccountData = {
  id: undefined,
  companyNumber: 'COMPANY_NUMBER',
  name: undefined
}
const fakeApplicationData = {
  id: 'APPLICATION_ID',
  accountId: 'ACCOUNT_ID',
  tradingName: null
}

const authToken = 'THE_AUTH_TOKEN'
const applicationId = fakeApplicationData.id

lab.beforeEach(() => {
  testAccount = new Account(fakeAccountData)
  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = () => {
    // Dynamics Account object
    return {
      '@odata.etag': 'W/"1039178"',
      defra_companyhouseid: fakeAccountData.companyNumber,
      defra_draft: true
    }
  }

  dynamicsCreateStub = DynamicsDalService.prototype.create
  DynamicsDalService.prototype.create = () => fakeApplicationData.accountId

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = () => fakeApplicationData.accountId

  applicationGetByIdStub = Application.getById
  Application.getById = () => new Application(fakeApplicationData)
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.create = dynamicsCreateStub
  DynamicsDalService.prototype.search = dynamicsSearchStub
  DynamicsDalService.prototype.update = dynamicsUpdateStub
  Application.getById = applicationGetByIdStub
})

lab.experiment('Account Model tests:', () => {
  lab.test('Constructor creates a Account object correctly', () => {
    const emptyAccount = new Account()
    Code.expect(emptyAccount).to.be.empty()

    Code.expect(testAccount.companyNumber).to.equal(fakeAccountData.companyNumber)
    Code.expect(testAccount.name).to.equal(fakeAccountData.name)

    // Should have been converted from null to undefined
    Code.expect(testAccount.tradingName).to.equal(undefined)
  })

  lab.test('getByApplicationId() method returns a single Account object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const account = await Account.getByApplicationId(authToken, applicationId)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(account.companyNumber).to.equal(fakeAccountData.companyNumber)
  })

  lab.test('save() method saves a new Account object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await testAccount.save(authToken, false)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testAccount.id).to.equal(fakeApplicationData.accountId)
  })

  lab.test('save() method updates an existing Account object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    testAccount.id = fakeApplicationData.accountId
    await testAccount.save(authToken, false)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testAccount.id).to.equal(fakeApplicationData.accountId)
  })
})
