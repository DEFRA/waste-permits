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
const fakeLocationDetailData = {
  gridReference: 'AB1234567890',
  locationId: '05486b21-a4ae-e711-8117-5065f38ac931'
}

lab.beforeEach(() => {
  testLocation = new Location(fakeLocationData)
  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = (query) => {
    // Dynamics LocationDetail object
    // TODO
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
    return '7a8e4354-4f24-e711-80fd-5065f38a1b01'
  }

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = (dataObject, query) => {
    return dataObject.id
  }
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.create = dynamicsCreateStub
  DynamicsDalService.prototype.search = dynamicsSearchStub
  DynamicsDalService.prototype.update = dynamicsUpdateStub
})

lab.experiment('LocationDetail Model tests:', () => {
  // TODO
  // lab.test('Constructor creates a Location object correctly', () => {
  //   const emptyLocation = new Location({})
  //   Code.expect(emptyLocation.name).to.be.undefined()
  //
  //   Code.expect(testLocation.name).to.equal(fakeLocationData.name)
  //   Code.expect(testLocation.applicationId).to.equal(fakeLocationData.applicationId)
  // })
  //
  // lab.test('getByApplicationId() method returns a single Location object', async () => {
  //   const spy = sinon.spy(DynamicsDalService.prototype, 'search')
  //   const site = await Location.getByApplicationId()
  //   Code.expect(spy.callCount).to.equal(1)
  //   Code.expect(site.name).to.equal(fakeLocationData.name)
  // })
  //
  // lab.test('save() method saves a new Location object', async () => {
  //   const spy = sinon.spy(DynamicsDalService.prototype, 'create')
  //   await testLocation.save()
  //   Code.expect(spy.callCount).to.equal(1)
  //   Code.expect(testLocation.id).to.equal('7a8e4354-4f24-e711-80fd-5065f38a1b01')
  // })
  //
  // lab.test('save() method updates an existing Location object', async () => {
  //   const spy = sinon.spy(DynamicsDalService.prototype, 'update')
  //   testLocation.id = '123'
  //   await testLocation.save()
  //   Code.expect(spy.callCount).to.equal(1)
  //   Code.expect(testLocation.id).to.equal('123')
  // })

  // TODO rework this
  // lab.test('isComplete() method correctly determines the completeness of a Location object', () => {
  //   const fakeEmptyLocationData = {
  //     name: undefined,
  //     gridReference: undefined,
  //     applicationId: '05486b21-a4ae-e711-8117-5065f38ac931'
  //   }
  //   testLocation = new Location(fakeEmptyLocationData)
  //   Code.expect(testLocation.isComplete()).to.be.false()
  //
  //   testLocation = new Location(fakeLocationData)
  //   Code.expect(testLocation.isComplete()).to.be.true()
  // })
})
