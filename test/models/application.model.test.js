'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Application = require('../../src/models/application.model')
const ApplicationReturn = require('../../src/models/applicationReturn.model')
const LoggingService = require('../../src/services/logging.service')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

const fakeOrigin = 'http://test.app.com'
const fakeSlug = 'SLUG'
let testApplication
let sandbox

const testApplicationId = 'APPLICATION_ID'
const authToken = 'THE_AUTH_TOKEN'

const fakeApplicationData = {
  accountId: 'ACCOUNT_ID',
  applicationNumber: 'APPLICATION_NUMBER'
}
const fakeApplicationReturnData = {
  applicationId: testApplicationId,
  slug: fakeSlug
}

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
  sandbox.stub(DynamicsDalService.prototype, 'callAction').value(() => {})
  sandbox.stub(ApplicationReturn, 'getByApplicationId').value(() => new ApplicationReturn(fakeApplicationReturnData))
  sandbox.stub(LoggingService, 'logDebug').value((text) => {})
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

  lab.test('sendSaveAndReturnEmail() method correctly initiates an email call action', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'callAction')
    const logSpy = sinon.spy(LoggingService, 'logDebug')
    await testApplication.sendSaveAndReturnEmail('AUTH_TOKEN', fakeOrigin)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(logSpy.callCount).to.equal(1)
    Code.expect(logSpy.calledWith(`Save and Return Url for Application "${fakeApplicationData.applicationNumber}": ${fakeOrigin}/r/${fakeSlug}`)).to.equal(true)
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
