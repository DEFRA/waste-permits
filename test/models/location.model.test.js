'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Location = require('../../src/models/location.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let dynamicsCreateStub
let dynamicsSearchStub
let dynamicsUpdateStub

let testLocation
const fakeLocationData = {
  name: 'THE_SITE_NAME',
  applicationId: 'APPLICATION_ID'
}
const testLocationId = 'LOCATION_ID'

const authToken = 'THE_AUTH_TOKEN'
const applicationId = fakeLocationData.applicationId
const applicationLineId = 'APPLICATION_LINE_ID'

lab.beforeEach(() => {
  testLocation = new Location(fakeLocationData)
  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = (query) => {
    // Dynamics Location object
    return {
      '@odata.context': 'THE_ODATA_ENDPOINT_AND_QUERY',
      value: [{
        '@odata.etag': 'W/"1234567"',
        defra_name: fakeLocationData.name,
        defra_locationid: fakeLocationData.applicationId
      }]
    }
  }

  dynamicsCreateStub = DynamicsDalService.prototype.create
  DynamicsDalService.prototype.create = (dataObject, query) => {
    return testLocationId
  }

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = (dataObject, query) => {
    return testLocationId
  }
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.create = dynamicsCreateStub
  DynamicsDalService.prototype.search = dynamicsSearchStub
  DynamicsDalService.prototype.update = dynamicsUpdateStub
})

lab.experiment('Location Model tests:', () => {
  lab.test('Constructor creates a Location object correctly', () => {
    const emptyLocation = new Location({})
    Code.expect(emptyLocation.name).to.be.undefined()

    Code.expect(testLocation.name).to.equal(fakeLocationData.name)
    Code.expect(testLocation.applicationId).to.equal(fakeLocationData.applicationId)
  })

  lab.test('getByApplicationId() method returns a single Location object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const site = await Location.getByApplicationId(authToken, applicationId, applicationLineId)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(site.name).to.equal(fakeLocationData.name)
  })

  lab.test('save() method saves a new Location object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await testLocation.save()
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testLocation.id).to.equal(testLocationId)
  })

  lab.test('save() method updates an existing Location object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    testLocation.id = testLocationId
    await testLocation.save()
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testLocation.id).to.equal(testLocationId)
  })
})
