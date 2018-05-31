'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const DynamicsDalService = require('../../../src/services/dynamicsDal.service')
const ApplicationLine = require('../../../src/models/applicationLine.model')
const Location = require('../../../src/models/location.model')
const LocationDetail = require('../../../src/models/locationDetail.model')
const Address = require('../../../src/models/address.model')
const SiteNameAndLocation = require('../../../src/models/taskList/siteNameAndLocation.model')

let sandbox

const fakeApplicationLine = {
  id: 'ca6b60f0-c1bf-e711-8111-5065f38adb81',
  applicationId: 'c1ae11ee-c1bf-e711-810e-5065f38bb461',
  standardRuleId: 'bd610c23-8ba7-e711-810a-5065f38a5b01',
  parametersId: 'cb6b60f0-c1bf-e711-8111-5065f38adb81'
}

const fakeAddress = {
  id: 'ADDRESS_DETAIL_ID',
  postcode: 'BS1 5AH'
}

const fakeLocation = {
  id: 'LOCATION_ID',
  siteName: 'THE SITE NAME',
  applicationId: 'APPLICATION_ID',
  applicationLineId: 'APPLICATION_LINE_ID'
}

const fakeLocationDetail = {
  id: 'LOCATION_DETAIL_ID',
  gridReference: 'AB1234567890',
  locationId: fakeLocation.id,
  addressId: fakeAddress.id
}

const request = {app: {data: {}}}
const authToken = 'THE_AUTH_TOKEN'
const applicationId = fakeApplicationLine.applicationId
const applicationLineId = fakeApplicationLine.id

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(DynamicsDalService.prototype, 'update').value((dataObject) => dataObject.id)
  sandbox.stub(ApplicationLine, 'getById').value(() => fakeApplicationLine)
  sandbox.stub(Location, 'getByApplicationId').value(() => new Location(fakeLocation))
  sandbox.stub(Location.prototype, 'save').value(() => {})
  sandbox.stub(LocationDetail, 'getByLocationId').value(() => new LocationDetail(fakeLocationDetail))
  sandbox.stub(LocationDetail.prototype, 'save').value(() => {})
  sandbox.stub(Address, 'getById').value(() => new Address(fakeAddress))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const testCompleteness = async (obj, expectedResult) => {
  fakeLocation.siteName = obj.siteName
  fakeLocationDetail.gridReference = obj.gridReference
  fakeAddress.postcode = obj.postcode
  const result = await SiteNameAndLocation.isComplete(authToken, applicationId, applicationLineId)
  Code.expect(result).to.equal(expectedResult)
}

lab.experiment('Task List: Site Name and Location Model tests:', () => {
  lab.test('getSiteName() method correctly retrieves undefined site name when there is no saved Location', async () => {
    Location.getByApplicationId = () => {
      return undefined
    }

    const result = await SiteNameAndLocation.getSiteName(request, authToken, applicationId, applicationLineId)
    Code.expect(result).to.be.equal(undefined)
  })

  lab.test('getSiteName() method correctly retrieves a site name when there is a saved Location', async () => {
    const result = await SiteNameAndLocation.getSiteName(request, authToken, applicationId, applicationLineId)
    Code.expect(result).to.be.equal(fakeLocation.siteName)
  })

  lab.test('saveSiteName() method correctly saves a site name', async () => {
    const spy = sinon.spy(Location.prototype, 'save')
    const appContext = {}
    await SiteNameAndLocation.saveSiteName(request, fakeLocation.siteName, appContext)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('getGridReference() method correctly retrieves undefined grid reference when there is no saved Location or LocationDetail', async () => {
    Location.getByApplicationId = () => {
      return undefined
    }
    LocationDetail.getByLocationId = () => {
      return undefined
    }
    const appContext = {}
    const result = await SiteNameAndLocation.getGridReference(request, appContext)
    Code.expect(result).to.be.equal(undefined)
  })

  lab.test('getGridReference() method correctly retrieves a site name when there is a saved Location and LocationDetail', async () => {
    const appContext = {}
    const result = await SiteNameAndLocation.getGridReference(request, appContext)
    Code.expect(result).to.be.equal(fakeLocationDetail.gridReference)
  })

  lab.test('saveGridReference() method correctly saves a grid reference', async () => {
    const spy = sinon.spy(LocationDetail.prototype, 'save')
    await SiteNameAndLocation.saveGridReference(request, fakeLocationDetail.gridReference, authToken, applicationId, applicationLineId)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('updateCompleteness() method updates the task list item completeness', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    await SiteNameAndLocation.updateCompleteness(authToken, applicationId, applicationLineId)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('isComplete() method correctly returns TRUE when the task list item is complete', async () => {
    const result = await SiteNameAndLocation.isComplete(authToken, applicationId, applicationLineId)
    Code.expect(result).to.be.true()
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete', async () => {
    await testCompleteness({
      siteName: undefined,
      gridReference: 'AB1234567890'
    }, false)

    await testCompleteness({
      siteName: '',
      gridReference: 'AB1234567890'
    }, false)

    await testCompleteness({
      siteName: 'THE SITE NAME',
      gridReference: undefined
    }, false)

    await testCompleteness({
      siteName: 'THE SITE NAME',
      gridReference: ''
    }, false)
  })
})
