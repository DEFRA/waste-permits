'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const LocationDetail = require('../../src/models/locationDetail.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let dynamicsCreateStub
let dynamicsSearchStub
let dynamicsUpdateStub

let testLocationDetail
const fakeLocationDetailData = {
  name: 'THE_SITE_NAME',
  gridReference: 'AB1234567890',
  locationId: 'LOCATION_ID'
}
const testLocationDetailId = 'LOCATION_DETAIL_ID'

const authToken = 'THE_AUTH_TOKEN'

lab.beforeEach(() => {
  testLocationDetail = new LocationDetail(fakeLocationDetailData)

  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = () => {
    // Dynamics LocationDetail object
    return {
      '@odata.context': 'THE_ODATA_ENDPOINT_AND_QUERY',
      value: [{
        '@odata.etag': 'W/"1234567"',
        defra_gridreferenceid: fakeLocationDetailData.gridReference,
        defra_locationdetailsid: fakeLocationDetailData.locationId,
        defra_name: fakeLocationDetailData.name
      }]
    }
  }

  dynamicsCreateStub = DynamicsDalService.prototype.create
  DynamicsDalService.prototype.create = () => testLocationDetailId

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = (dataObject) => dataObject.id
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.create = dynamicsCreateStub
  DynamicsDalService.prototype.search = dynamicsSearchStub
  DynamicsDalService.prototype.update = dynamicsUpdateStub
})

lab.experiment('LocationDetail Model tests:', () => {
  lab.test('Constructor creates a LocationDetail object correctly', () => {
    const emptyLocationDetail = new LocationDetail({})
    Code.expect(emptyLocationDetail.gridReference).to.be.undefined()

    Code.expect(testLocationDetail.gridReference).to.equal(fakeLocationDetailData.gridReference)
    Code.expect(testLocationDetail.locationId).to.equal(fakeLocationDetailData.locationId)
  })

  lab.test('getByLocationId() method returns a single LocationDetail object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const locationDetail = await LocationDetail.getByLocationId(authToken, fakeLocationDetailData.locationId)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(locationDetail.gridReference).to.equal(fakeLocationDetailData.gridReference)
  })

  lab.test('save() method saves a new LocationDetail object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await testLocationDetail.save(authToken)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testLocationDetail.id).to.equal(testLocationDetailId)
  })

  lab.test('save() method updates an existing LocationDetail object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    testLocationDetail.id = testLocationDetailId
    await testLocationDetail.save(authToken)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testLocationDetail.id).to.equal(testLocationDetailId)
  })
})
