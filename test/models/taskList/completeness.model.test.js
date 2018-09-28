'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const DynamicsDalService = require('../../../src/services/dynamicsDal.service')
const ApplicationLine = require('../../../src/models/applicationLine.model')
const TaskList = require('../../../src/models/taskList/taskList.model')
const Completeness = require('../../../src/models/taskList/completeness.model')

const context = { authToken: 'AUTH_TOKEN' }
let fakeApplicationLine

let sandbox

lab.beforeEach(() => {
  fakeApplicationLine = {
    id: 'APPLICATION_LINE_ID',
    applicationId: 'APPLICATION_ID'
  }

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(DynamicsDalService.prototype, 'update').value((dataObject) => dataObject.id)
  sandbox.stub(ApplicationLine, 'getById').value(() => fakeApplicationLine)
  sandbox.stub(TaskList, 'getCompleted').value(() => false)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: Completeness Model tests:', () => {
  lab.test('updateCompleteness() method updates the task list item completeness', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    await Completeness.updateCompleteness(context)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete', async () => {
    const result = await Completeness.isComplete()
    Code.expect(result).to.equal(false)
  })

  lab.test('isComplete() method correctly returns TRUE when the task list item is complete', async () => {
    TaskList.getCompleted = () => true
    const result = await Completeness.isComplete()
    Code.expect(result).to.equal(true)
  })
})
