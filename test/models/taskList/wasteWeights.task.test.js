'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const WasteWeights = require('../../../src/models/wasteWeights.model')
const WasteWeightsTask = require('../../../src/models/taskList/wasteWeights.task')

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(WasteWeights, 'getAllWeightsHaveBeenEnteredForApplication').resolves(true)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: WasteWeights Model tests:', () => {
  lab.test('checkComplete() method correctly returns underlying model value', async () => {
    const result = await WasteWeightsTask.checkComplete()
    Code.expect(result).to.equal(true)
  })
})
