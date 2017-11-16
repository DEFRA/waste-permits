'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Application = require('../../src/models/application.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let testApplication
let dynamicsCreateStub
let dynamicsSearchStub
let dynamicsUpdateStub

const fakeApplicationData = {
  accountId: 'ACCOUNT_ID'
}
let testApplicationId = 'APPLICATION_ID'

lab.beforeEach(() => {
  testApplication = new Application(fakeApplicationData)

  // Stub methods
  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = () => {
    // Dynamics Application object
    return {
      '@odata.etag': 'W/"1039198"',
      _defra_customerid_value: fakeApplicationData.accountId
    }
  }

  dynamicsCreateStub = DynamicsDalService.prototype.create
  DynamicsDalService.prototype.create = () => testApplicationId

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = () => testApplicationId
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.search = dynamicsSearchStub
  DynamicsDalService.prototype.create = dynamicsCreateStub
  DynamicsDalService.prototype.update = dynamicsUpdateStub
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
    await testApplication.save()
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testApplication.id).to.equal(testApplicationId)
  })
})
