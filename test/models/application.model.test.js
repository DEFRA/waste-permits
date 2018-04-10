'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Application = require('../../src/models/application.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let testApplication
let sandbox

const fakeApplicationData = {
  accountId: 'ACCOUNT_ID'
}
const testApplicationId = 'APPLICATION_ID'
const authToken = 'THE_AUTH_TOKEN'

lab.beforeEach(() => {
  testApplication = new Application(fakeApplicationData)
  testApplication.delay = 0

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(DynamicsDalService.prototype, 'create').value(() => testApplicationId)
  sandbox.stub(DynamicsDalService.prototype, 'update').value(() => testApplicationId)
  sandbox.stub(DynamicsDalService.prototype, 'search').value(() => {
    // Dynamics Application object
    return {
      '@odata.etag': 'W/"1039198"',
      _defra_customerid_value: fakeApplicationData.accountId
    }
  })
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Application Model tests:', () => {
  lab.test('getById() method correctly retrieves an Application object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const application = await Application.getById('AUTH_TOKEN', testApplicationId)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(application.accountId).to.equal(fakeApplicationData.accountId)
    Code.expect(application.id).to.equal(testApplicationId)
  })

  lab.test('save() method saves a new Application object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await testApplication.save(authToken)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testApplication.id).to.equal(testApplicationId)
  })

  lab.test('save() method updates an existing Application object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    testApplication.id = testApplicationId
    await testApplication.save(authToken)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testApplication.id).to.equal(testApplicationId)
  })
})
