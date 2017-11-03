'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Application = require('../../src/models/application.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let testApplication
let dynamicsCreateStub
let applicationLineId = 'APPLICATION_LINE_ID'

lab.beforeEach(() => {
  testApplication = new Application()

  // Stub methods
  dynamicsCreateStub = DynamicsDalService.prototype.create
  DynamicsDalService.prototype.create = (dataObject, query) => {
    return applicationLineId
  }
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.create = dynamicsCreateStub
})

lab.experiment('Application Model tests:', () => {
  lab.test('save() method saves a new Application object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await testApplication.save()
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testApplication.id).to.equal(applicationLineId)
  })
})
