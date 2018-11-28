'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const DataStore = require('../../../src/models/dataStore.model')
const ApplicationLine = require('../../../src/persistence/entities/applicationLine.entity')
const BaseTask = require('../../../src/models/taskList/base.task')

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(DataStore, 'get').value(async () => mocks.dataStore)
  sandbox.stub(DataStore.prototype, 'save').value(async () => mocks.dataStore.id)
  sandbox.stub(ApplicationLine, 'getById').value(async () => mocks.applicationLine)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: Completeness Model tests:', () => {
  lab.test('isComplete() default method correctly returns FALSE', async () => {
    const result = await BaseTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
  })

  lab.test('updateCompleteness() method saves the task list item completeness', async () => {
    const spy = sinon.spy(DataStore.prototype, 'save')
    await BaseTask.updateCompleteness(mocks.context)
    Code.expect(spy.callCount).to.equal(1)
  })
})
