'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const Account = require('../../../src/persistence/entities/account.entity')
const Application = require('../../../src/persistence/entities/application.entity')
const dynamicsDal = require('../../../src/services/dynamicsDal.service')

let sandbox

let testAccount
const fakeAccountData = {
  companyNumber: '01234567',
  organisationType: 'ORGANISATION_TYPE',
  accountName: 'COMPANY_NAME',
  isDraft: true
}

const fakeApplicationData = {
  id: 'APPLICATION_ID',
  organisationType: 'ORGANISATION_TYPE',
  permitHolderOrganisationId: 'PERMIT_HOLDER_ORGANISATION_ID',
  tradingName: null
}

const context = {
  applicationId: fakeApplicationData.id
}

lab.beforeEach(() => {
  testAccount = new Account(fakeAccountData)

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(dynamicsDal, 'callAction').value(() => {})
  sandbox.stub(dynamicsDal, 'search').value(() => {})
  sandbox.stub(dynamicsDal, 'create').value(() => fakeApplicationData.permitHolderOrganisationId)
  sandbox.stub(dynamicsDal, 'update').value(() => fakeApplicationData.permitHolderOrganisationId)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplicationData))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Account Entity tests:', () => {
  lab.test('Constructor creates a Account object correctly', () => {
    dynamicsDal.search = () => {
      // Dynamics Account object
      return {
        '@odata.etag': 'W/"1039178"',
        accountid: fakeAccountData.id,
        name: fakeAccountData.accountName,
        defra_companyhouseid: fakeAccountData.companyNumber,
        defra_organisation_type: fakeAccountData.organisationType,
        defra_draft: true
      }
    }

    const emptyAccount = new Account()
    Code.expect(emptyAccount.id).to.be.equal(undefined)

    Code.expect(testAccount.companyNumber).to.equal(fakeAccountData.companyNumber)
    Code.expect(testAccount.accountName).to.equal(fakeAccountData.accountName)
    Code.expect(testAccount.organisationType).to.equal(fakeAccountData.organisationType)

    // Should have been converted from null to undefined
    Code.expect(testAccount.tradingName).to.equal(undefined)
  })

  lab.test('getByApplicationId() method returns a single Account object', async () => {
    dynamicsDal.search = () => {
      // Dynamics Account object
      return {
        '@odata.etag': 'W/"1039178"',
        accountid: fakeAccountData.id,
        name: fakeAccountData.accountName,
        defra_companyhouseid: fakeAccountData.companyNumber,
        defra_organisation_type: fakeAccountData.organisationType,
        defra_draft: true
      }
    }

    const spy = sinon.spy(dynamicsDal, 'search')
    const account = await Account.getByApplicationId(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(account.companyNumber).to.equal(fakeAccountData.companyNumber)
    Code.expect(account.organisationType).to.equal(fakeAccountData.organisationType)
  })

  lab.test('getByCompanyNumber() method returns a single Account object', async () => {
    dynamicsDal.search = () => {
      // Object containing an array of Dynamics Account objects
      return {
        value: [{
          '@odata.etag': 'W/"1039178"',
          accountid: fakeAccountData.id,
          name: fakeAccountData.accountName,
          defra_companyhouseid: fakeAccountData.companyNumber,
          defra_organisation_type: fakeAccountData.organisationType,
          defra_draft: true
        }]
      }
    }

    const spy = sinon.spy(dynamicsDal, 'search')
    const account = await Account.getByCompanyNumber(context, fakeAccountData.companyNumber)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(account.companyNumber).to.equal(fakeAccountData.companyNumber)
    Code.expect(account.organisationType).to.equal(fakeAccountData.organisationType)
  })

  lab.test('save() method saves a new Account object', async () => {
    const spy = sinon.spy(dynamicsDal, 'create')
    await testAccount.save(context, false)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testAccount.id).to.equal(fakeApplicationData.permitHolderOrganisationId)
  })

  lab.test('save() method updates an existing Account object', async () => {
    const spy = sinon.spy(dynamicsDal, 'update')
    testAccount.id = fakeApplicationData.permitHolderOrganisationId
    await testAccount.save(context, false)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testAccount.id).to.equal(fakeApplicationData.permitHolderOrganisationId)
  })

  lab.test('confirm() method confirms an Account object', async () => {
    const spy = sinon.spy(dynamicsDal, 'callAction')
    await testAccount.confirm(context)
    Code.expect(spy.callCount).to.equal(1)
  })
})
