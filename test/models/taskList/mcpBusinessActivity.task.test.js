'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const NeedToConsultModel = require('../../../src/models/needToConsult.model')
const McpBusinessType = require('../../../src/models/mcpBusinessType.model')
const McpBusinessActivityTask = require('../../../src/models/taskList/mcpBusinessActivity.task')

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(NeedToConsultModel, 'get').callsFake(async () => mocks.needToConsult)
  sandbox.stub(NeedToConsultModel.prototype, 'save').callsFake(async () => null)
  sandbox.stub(McpBusinessType, 'get').callsFake(async () => mocks.mcpBusinessType)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: McpBusinessActivity Model tests:', () => {
  lab.test('isComplete() method correctly returns FALSE when no value selected', async () => {
    const result = await McpBusinessActivityTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
  })

  lab.test('isComplete() method correctly returns TRUE when value selected', async () => {
    mocks.mcpBusinessType.code = 'CODE'
    const result = await McpBusinessActivityTask.isComplete(mocks.context)
    Code.expect(result).to.equal(true)
  })
})
