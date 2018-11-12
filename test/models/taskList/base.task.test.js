'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const DataStore = require('../../../src/models/dataStore.model')
const ApplicationLine = require('../../../src/persistence/entities/applicationLine.entity')
const BaseTask = require('../../../src/models/taskList/base.task')

const context = { authToken: 'AUTH_TOKEN' }

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  BaseTask.completenessParameter = 'completedFlag'

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(DataStore, 'get').value(() => mocks.dataStore)
  sandbox.stub(DataStore.prototype, 'save').value(() => mocks.dataStore.id)
  sandbox.stub(ApplicationLine, 'getById').value(() => mocks.applicationLine)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: Completeness Model tests:', () => {
  lab.test('updateCompleteness() method saves the task list item completeness', async () => {
    const spy = sinon.spy(DataStore.prototype, 'save')
    await BaseTask.updateCompleteness(context)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('isComplete() default method correctly returns FALSE', async () => {
    const result = await BaseTask.isComplete()
    Code.expect(result).to.equal(false)
  })
})
