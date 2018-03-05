'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const DynamicsDalService = require('../../../src/services/dynamicsDal.service')
const ApplicationLine = require('../../../src/models/applicationLine.model')
const Application = require('../../../src/models/application.model')
const Confidentiality = require('../../../src/models/taskList/confidentiality.model')

let dynamicsUpdateStub
let applicationLineGetByIdStub
let applicationGetByIdStub
let applicationSaveStub

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
  // Stub methods

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = (dataObject) => dataObject.id

  applicationLineGetByIdStub = ApplicationLine.getById
  ApplicationLine.getById = () => fakeApplicationLine

  applicationGetByIdStub = Application.getById
  Application.getById = () => {
    return new Application(fakeApplication)
  }

  applicationSaveStub = Application.prototype.save
  Application.prototype.save = () => {}
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.update = dynamicsUpdateStub
  ApplicationLine.getById = applicationLineGetByIdStub
  Application.getById = applicationGetByIdStub
  Application.prototype.save = applicationSaveStub
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
