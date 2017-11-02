'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const DynamicsDalService = require('../../../src/services/dynamicsDal.service')
const ApplicationLine = require('../../../src/models/applicationLine.model')
const Location = require('../../../src/models/location.model')
const LocationDetail = require('../../../src/models/locationDetail.model')
const SiteNameAndLocation = require('../../../src/models/taskList/siteNameAndLocation.model')

let dynamicsUpdateStub
let applicationLineGetByIdStub
let locationGetByApplicationIdStub
let locationDetailGetByLocationIdStub

const fakeApplicationLine = {
  id: 'ca6b60f0-c1bf-e711-8111-5065f38adb81',
  applicationId: 'c1ae11ee-c1bf-e711-810e-5065f38bb461',
  standardRuleId: 'bd610c23-8ba7-e711-810a-5065f38a5b01',
  parametersId: 'cb6b60f0-c1bf-e711-8111-5065f38adb81'
}

const fakeLocation = {
  id: 'dff66fce-18b8-e711-8119-5065f38ac931',
  name: 'THE SITE NAME',
  applicationId: '403710b7-18b8-e711-810d-5065f38bb461',
  applicationLineId: '423710b7-18b8-e711-810d-5065f38bb461',
  save: (authToken) => {}
}

const fakeLocationDetail = {
  id: 'dff66fce-18b8-e711-8119-5065f38ac931',
  gridReference: 'AB1234567890',
  locationId: fakeLocation.id,
  save: (authToken) => {}
}

lab.beforeEach(() => {
  // Stub methods

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = (dataObject, query) => {
    return dataObject.id
  }

  applicationLineGetByIdStub = ApplicationLine.getById
  ApplicationLine.getById = (authToken, applicationLineId) =>{
    return fakeApplicationLine
  }

  locationGetByApplicationIdStub = Location.getByApplicationId
  Location.getByApplicationId = (authToken, applicationId, applicationLineId) => {
    return fakeLocation
  }

  locationDetailGetByLocationIdStub = LocationDetail.getByLocationId
  LocationDetail.getByLocationId = (authToken, locationId) => {
    return fakeLocationDetail
  }
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.update = dynamicsUpdateStub
  ApplicationLine.getById = applicationLineGetByIdStub
  Location.getByApplicationId = locationGetByApplicationIdStub
  LocationDetail.getByLocationId = locationDetailGetByLocationIdStub
})

async function testCompleteness(obj, expectedResult) {
  fakeLocation.name = obj.name
  fakeLocationDetail.gridReference = obj.gridReference
  let result = await SiteNameAndLocation._isComplete(obj.params.authToken, obj.params.applicationId, obj.params.applicationLineId)
  Code.expect(result).to.equal(expectedResult)
}

lab.experiment('Task List: Site Name and Location Model tests:', () => {
  lab.test('updateCompleteness() method updates the task list item completeness', async () => {

    const spy = sinon.spy(DynamicsDalService.prototype, 'update')

    const authToken = 'THE_AUTH_TOKEN'
    const applicationId = fakeApplicationLine.applicationId
    const applicationLineId = fakeApplicationLine.id

    await SiteNameAndLocation.updateCompleteness(authToken, applicationId, applicationLineId)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('isComplete() method correctly returns TRUE when the task list item is complete', async () => {
    const authToken = 'THE_AUTH_TOKEN'
    const applicationId = fakeApplicationLine.applicationId
    const applicationLineId = fakeApplicationLine.id

    const result = await SiteNameAndLocation._isComplete(authToken, applicationId, applicationLineId)
    Code.expect(result).to.be.true()
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete', async () => {
    const authToken = 'THE_AUTH_TOKEN'
    const applicationId = fakeApplicationLine.applicationId
    const applicationLineId = fakeApplicationLine.id

    const params = {
      authToken: 'THE_AUTH_TOKEN',
      applicationId: fakeApplicationLine.applicationId,
      applicationLineId: fakeApplicationLine.id
    }

    await testCompleteness({
      params: params,
      name: undefined,
      gridReference: 'AB1234567890'
    }, false)

    await testCompleteness({
      params: params,
      name: '',
      gridReference: 'AB1234567890'
    }, false)

    await testCompleteness({
      params: params,
      name: 'THE SITE NAME',
      gridReference: undefined
    }, false)

    await testCompleteness({
      params: params,
      name: 'THE SITE NAME',
      gridReference: ''
    }, false)
  })
})
