'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Application = require('../../src/models/application.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let testApplication
let dynamicsCreateStub

lab.beforeEach((done) => {
  testApplication = new Application()

  // Stub methods
  dynamicsCreateStub = DynamicsDalService.prototype.create
  DynamicsDalService.prototype.create = (dataObject, query) => {
    return '7a8e4354-4f24-e711-80fd-5065f38a1b01'
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  DynamicsDalService.prototype.create = dynamicsCreateStub

  done()
})

lab.experiment('Application Model tests:', () => {
  lab.test('save() method saves a new Application object', (done) => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    testApplication.save().then(() => {
      Code.expect(spy.callCount).to.equal(1)
      Code.expect(testApplication.id).to.be.equal('7a8e4354-4f24-e711-80fd-5065f38a1b01')

      done()
    })
  })
})
