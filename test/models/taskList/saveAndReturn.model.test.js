'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const DynamicsDalService = require('../../../src/services/dynamicsDal.service')
const Application = require('../../../src/models/application.model')
const ApplicationLine = require('../../../src/models/applicationLine.model')
const SaveAndReturn = require('../../../src/models/taskList/saveAndReturn.model')

let fakeApplicationLine
let fakeApplication

const authToken = 'THE_AUTH_TOKEN'

let sandbox

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    saveAndReturnEmail: 'SAVE_AND_RETURN_EMAIL'
  }

  fakeApplicationLine = {
    id: 'APPLICATION_LINE_ID',
    applicationId: fakeApplication.id
  }

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()
  // Stub the asynchronous model methods
  sandbox.stub(DynamicsDalService.prototype, 'update').value((dataObject) => dataObject.id)
  sandbox.stub(Application, 'getById').value(() => fakeApplication)
  sandbox.stub(ApplicationLine, 'getById').value(() => fakeApplicationLine)
  sandbox.stub(ApplicationLine, 'getCompleted').value(() => false)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: SaveAndReturn Model tests:', () => {
  lab.test('updateCompleteness() method updates the task list item completeness', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    await SaveAndReturn.updateCompleteness(authToken, fakeApplication.id, fakeApplicationLine.id)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('isComplete() method correctly returns TRUE when the task list item is complete', async () => {
    ApplicationLine.getCompleted = () => true
    const result = await SaveAndReturn.isComplete(authToken, fakeApplication.id)
    Code.expect(result).to.equal(true)
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete', async () => {
    ApplicationLine.getCompleted = () => false
    const result = await SaveAndReturn.isComplete(authToken, fakeApplication.id)
    Code.expect(result).to.equal(false)
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is complete but the save and return email has not been entered', async () => {
    delete fakeApplication.saveAndReturnEmail
    const result = await SaveAndReturn.isComplete(authToken, fakeApplication.id)
    Code.expect(result).to.equal(false)
  })
})
