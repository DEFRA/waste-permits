'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Application = require('../../../src/models/application.model')
const MiningWasteDetails = require('../../../src/models/taskList/miningWasteDetails.model')

const COMPLETENESS_PARAMETER = 'defra_miningdatarequired_completed'

let fakeApplication
let sandbox

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    miningWastePlan: 910400000,
    miningWasteWeight: 'one,hundred-thousand'
  }

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(Application, 'getById').value(() => fakeApplication)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: MiningWasteDetails Model tests:', () => {
  lab.test(`completenessParameter is ${COMPLETENESS_PARAMETER}`, async () => {
    Code.expect(MiningWasteDetails.completenessParameter).to.equal(COMPLETENESS_PARAMETER)
  })

  lab.test('checkComplete() method correctly returns FALSE when mining waste plan is not set', async () => {
    delete fakeApplication.miningWastePlan
    const result = await MiningWasteDetails.checkComplete()
    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns FALSE when mining waste weight is not set', async () => {
    delete fakeApplication.miningWasteWeight
    const result = await MiningWasteDetails.checkComplete()
    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns TRUE when mining waste plan and weight are both set', async () => {
    const result = await MiningWasteDetails.checkComplete()
    Code.expect(result).to.equal(true)
  })
})
