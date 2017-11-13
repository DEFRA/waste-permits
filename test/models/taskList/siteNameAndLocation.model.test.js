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

let dynamicsUpdateStub
let applicationLineGetByIdStub
let locationGetByApplicationIdStub
let locationDetailGetByLocationIdStub
let locationSaveStub
let locationDetailSaveStub
let addressGetByIdStub

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
  name: 'THE SITE NAME',
  applicationId: 'APPLICATION_ID',
  applicationLineId: 'APPLICATION_LINE_ID'
}

const fakeLocationDetail = {
  id: 'LOCATION_DETAIL_ID',
  gridReference: 'AB1234567890',
  locationId: fakeLocation.id,
  addressId: fakeAddress.id
}

const request = undefined
const authToken = 'THE_AUTH_TOKEN'
const applicationId = fakeApplicationLine.applicationId
const applicationLineId = fakeApplicationLine.id

lab.beforeEach(() => {
  // Stub methods

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = (dataObject, query) => {
    return dataObject.id
  }

  applicationLineGetByIdStub = ApplicationLine.getById
  ApplicationLine.getById = (authToken, applicationLineId) => {
    return fakeApplicationLine
  }

  locationGetByApplicationIdStub = Location.getByApplicationId
  Location.getByApplicationId = (authToken, applicationId, applicationLineId) => {
    return new Location(fakeLocation)
  }

  locationDetailGetByLocationIdStub = LocationDetail.getByLocationId
  LocationDetail.getByLocationId = (authToken, locationId) => {
    return new LocationDetail(fakeLocationDetail)
  }

  locationSaveStub = Location.prototype.save
  Location.prototype.save = (authToken) => {}

  locationDetailSaveStub = LocationDetail.prototype.save
  LocationDetail.prototype.save = (authToken) => {}

  addressGetByIdStub = Address.getById
  Address.getById = (authToken, id) => {
    return new Address(fakeAddress)
  }
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.update = dynamicsUpdateStub
  ApplicationLine.getById = applicationLineGetByIdStub
  Location.getByApplicationId = locationGetByApplicationIdStub
  LocationDetail.getByLocationId = locationDetailGetByLocationIdStub
  Location.prototype.save = locationSaveStub
  LocationDetail.prototype.save = locationDetailSaveStub
  Address.getById = addressGetByIdStub
})

const testCompleteness = async (obj, expectedResult) => {
  fakeLocation.name = obj.name
  fakeLocationDetail.gridReference = obj.gridReference
  fakeAddress.postcode = obj.postcode
  const result = await SiteNameAndLocation._isComplete(authToken, applicationId, applicationLineId)
  Code.expect(result).to.equal(expectedResult)
}

lab.experiment('Task List: Site Name and Location Model tests:', () => {
  lab.test('getSiteName() method correctly retrieves undefined site name when there is no saved Location', async () => {
    Location.getByApplicationId = (authToken, applicationId, applicationLineId) => {
      return undefined
    }

    const result = await SiteNameAndLocation.getSiteName(request, authToken, applicationId, applicationLineId)
    Code.expect(result).to.be.equal(undefined)
  })

  lab.test('getSiteName() method correctly retrieves a site name when there is a saved Location', async () => {
    const result = await SiteNameAndLocation.getSiteName(request, authToken, applicationId, applicationLineId)
    Code.expect(result).to.be.equal(fakeLocation.name)
  })

  lab.test('saveSiteName() method correctly saves a site name', async () => {
    const spy = sinon.spy(Location.prototype, 'save')
    await SiteNameAndLocation.saveSiteName(request, fakeLocation.siteName, authToken, applicationId, applicationLineId)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('getGridReference() method correctly retrieves undefined grid reference when there is no saved Location or LocationDetail', async () => {
    Location.getByApplicationId = (authToken, applicationId, applicationLineId) => {
      return undefined
    }
    LocationDetail.getByLocationId = (authToken, locationId) => {
      return undefined
    }
    const result = await SiteNameAndLocation.getGridReference(request, authToken, applicationId, applicationLineId)
    Code.expect(result).to.be.equal(undefined)
  })

  lab.test('getGridReference() method correctly retrieves a site name when there is a saved Location and LocationDetail', async () => {
    const result = await SiteNameAndLocation.getGridReference(request, authToken, applicationId, applicationLineId)
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
    const result = await SiteNameAndLocation._isComplete(authToken, applicationId, applicationLineId)
    Code.expect(result).to.be.true()
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete', async () => {
    await testCompleteness({
      name: undefined,
      gridReference: 'AB1234567890'
    }, false)

    await testCompleteness({
      name: '',
      gridReference: 'AB1234567890'
    }, false)

    await testCompleteness({
      name: 'THE SITE NAME',
      gridReference: undefined
    }, false)

    await testCompleteness({
      name: 'THE SITE NAME',
      gridReference: ''
    }, false)
  })
})
