'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const DynamicsDalService = require('../../../src/services/dynamicsDal.service')
const ApplicationLine = require('../../../src/models/applicationLine.model')
const CostTime = require('../../../src/models/taskList/costTime.model')

const fakeApplicationLine = {
  id: 'APPLICATION_LINE_ID',
  applicationId: 'APPLICATION_ID'
}

const authToken = 'THE_AUTH_TOKEN'
const applicationId = fakeApplicationLine.applicationId
const applicationLineId = fakeApplicationLine.id

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()
  // Stub the asynchronous model methods
  sandbox.stub(DynamicsDalService.prototype, 'update').value((dataObject) => dataObject.id)
  sandbox.stub(ApplicationLine, 'getById').value(() => fakeApplicationLine)
  sandbox.stub(ApplicationLine, 'getCompleted').value(() => false)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: CostTime Model tests:', () => {
  lab.test('updateCompleteness() method updates the task list item completeness', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    await CostTime.updateCompleteness(authToken, applicationId, applicationLineId)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('isComplete() method correctly returns TRUE when the task list item is complete', async () => {
    ApplicationLine.getCompleted = () => true
    const result = await CostTime.isComplete(authToken, applicationId)
    Code.expect(result).to.equal(true)
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete', async () => {
    ApplicationLine.getCompleted = () => false
    const result = await CostTime.isComplete(authToken, applicationId)
    Code.expect(result).to.equal(false)
  })
})
