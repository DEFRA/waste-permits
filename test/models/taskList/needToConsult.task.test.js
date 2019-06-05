'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const NeedToConsultModel = require('../../../src/models/needToConsult.model')
const Application = require('../../../src/persistence/entities/application.entity')
const NeedToConsultTask = require('../../../src/models/taskList/needToConsult.task')

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(NeedToConsultModel, 'get').callsFake(async () => mocks.needToConsult)
  sandbox.stub(NeedToConsultModel.prototype, 'save').callsFake(async () => null)
  sandbox.stub(Application, 'getById').callsFake(async () => mocks.application)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: NeedToConsult Model tests:', () => {
  lab.test('isComplete() method correctly returns FALSE initially', async () => {
    const result = await NeedToConsultTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
  })

  lab.test('isComplete() method correctly returns TRUE when consultees entered', async () => {
    mocks.needToConsult.sewer = true
    mocks.needToConsult.sewerageUndertaker = 'SEWERAGE UNDERTAKER'
    mocks.needToConsult.harbour = true
    mocks.needToConsult.harbourAuthority = 'HARBOUR AUTHORITY'
    mocks.needToConsult.fisheries = true
    mocks.needToConsult.fisheriesCommittee = 'FISHERIES COMMITTEE'
    mocks.needToConsult.none = false
    const result = await NeedToConsultTask.isComplete(mocks.context)
    Code.expect(result).to.equal(true)
  })

  lab.test('isComplete() method correctly returns TRUE when None selected', async () => {
    mocks.needToConsult.none = true
    const result = await NeedToConsultTask.isComplete(mocks.context)
    Code.expect(result).to.equal(true)
  })

  lab.test('isComplete() method correctly returns FALSE when consultee selected but no names entered', async () => {
    let result
    mocks.needToConsult.sewer = true
    result = await NeedToConsultTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
    delete mocks.needToConsult.sewer
    mocks.needToConsult.harbour = true
    result = await NeedToConsultTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
    delete mocks.needToConsult.harbour
    mocks.needToConsult.fisheries = true
    result = await NeedToConsultTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
  })
})
