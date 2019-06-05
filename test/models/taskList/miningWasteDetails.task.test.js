'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const Application = require('../../../src/persistence/entities/application.entity')
const MiningWasteDetails = require('../../../src/models/taskList/miningWasteDetails.task')

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(Application, 'getById').callsFake(async () => mocks.application)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: MiningWasteDetails Model tests:', () => {
  lab.test('isComplete() method correctly returns FALSE when mining waste plan is not set', async () => {
    delete mocks.application.miningWastePlan
    const result = await MiningWasteDetails.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
  })

  lab.test('isComplete() method correctly returns FALSE when mining waste weight is not set', async () => {
    delete mocks.application.miningWasteWeight
    const result = await MiningWasteDetails.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
  })

  lab.test('isComplete() method correctly returns TRUE when mining waste plan and weight are both set', async () => {
    const result = await MiningWasteDetails.isComplete(mocks.context)
    Code.expect(result).to.equal(true)
  })
})
