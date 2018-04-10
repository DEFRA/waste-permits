'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const DynamicsDalService = require('../../../src/services/dynamicsDal.service')
const ApplicationLine = require('../../../src/models/applicationLine.model')
const Application = require('../../../src/models/application.model')
const Confidentiality = require('../../../src/models/taskList/confidentiality.model')

let sandbox

const fakeApplicationLine = {
  id: 'ca6b60f0-c1bf-e711-8111-5065f38adb81',
  applicationId: 'c1ae11ee-c1bf-e711-810e-5065f38bb461'
}

const fakeApplication = {
  id: 'APPLICATION_ID',
  confidentiality: 'THE CONFIDENTIALITY'
}

const authToken = 'THE_AUTH_TOKEN'
const applicationId = fakeApplicationLine.applicationId
const applicationLineId = fakeApplicationLine.id

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(DynamicsDalService.prototype, 'update').value((dataObject) => dataObject.id)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(ApplicationLine, 'getById').value(() => fakeApplicationLine)
  sandbox.stub(Application.prototype, 'save').value(() => {})
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const testCompleteness = async (obj, expectedResult) => {
  fakeApplication.confidentiality = obj.confidentiality
  const result = await Confidentiality.isComplete(authToken, applicationId)
  Code.expect(result).to.equal(expectedResult)
}

lab.experiment('Task List: Confidentiality Model tests:', () => {
  lab.test('updateCompleteness() method updates the task list item completeness', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    await Confidentiality.updateCompleteness(authToken, applicationId, applicationLineId)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('isComplete() method correctly returns TRUE when the task list item is complete', async () => {
    await testCompleteness({
      confidentiality: true
    }, true)

    await testCompleteness({
      confidentiality: false
    }, true)
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete', async () => {
    await testCompleteness({
      confidentiality: undefined
    }, false)
  })
})
