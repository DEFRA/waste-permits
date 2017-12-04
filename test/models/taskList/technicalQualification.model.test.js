'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const DynamicsDalService = require('../../../src/services/dynamicsDal.service')
const ApplicationLine = require('../../../src/models/applicationLine.model')
const Application = require('../../../src/models/application.model')
const TechnicalQualification = require('../../../src/models/taskList/technicalQualification.model')

let dynamicsUpdateStub
let applicationLineGetByIdStub
let applicationGetByIdStub
let applicationSaveStub

const fakeApplicationLine = {
  id: 'APPLICATION_LINE_ID',
  applicationId: 'APPLICATION_ID'
}

const fakeApplication = {
  id: 'APPLICATION_ID',
  technicalQualification: 'TECHNICAL_QUALIFICATION'
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
  fakeApplication.technicalQualification = obj.technicalQualification
  const result = await TechnicalQualification._isComplete(authToken, applicationId)
  Code.expect(result).to.equal(expectedResult)
}

lab.experiment('Task List: TechnicalQualification Model tests:', () => {
  lab.test('updateCompleteness() method updates the task list item completeness', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    await TechnicalQualification.updateCompleteness(authToken, applicationId, applicationLineId)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('isComplete() method correctly returns TRUE when the task list item is complete', async () => {
    await testCompleteness({
      technicalQualification: 'TECHNICAL_QUALIFICATION'
    }, true)
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete', async () => {
    await testCompleteness({
      technicalQualification: undefined
    }, false)
  })
})
