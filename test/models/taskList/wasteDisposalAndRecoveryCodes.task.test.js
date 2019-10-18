'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const WasteDisposalAndRecoveryCodes = require('../../../src/models/wasteDisposalAndRecoveryCodes.model')
const WasteDisposalAndRecoveryCodesTask = require('../../../src/models/taskList/wasteDisposalAndRecoveryCodes.task')

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(WasteDisposalAndRecoveryCodes, 'getAllCodesHaveBeenSelectedForApplication').resolves(true)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: WasteDisposalAndRecoveryCodes Model tests:', () => {
  lab.test('checkComplete() method correctly returns underlying model value', async () => {
    const result = await WasteDisposalAndRecoveryCodesTask.checkComplete()
    Code.expect(result).to.equal(true)
  })
})
