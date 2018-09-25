'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const LocationDetail = require('../../../src/persistence/entities/locationDetail.entity')
const DynamicsDalService = require('../../../src/services/dynamicsDal.service')

let sandbox

let testLocationDetail
const fakeLocationDetailData = {
  name: 'THE_SITE_NAME',
  gridReference: 'AB1234567890',
  locationId: 'LOCATION_ID'
}
const testLocationDetailId = 'LOCATION_DETAIL_ID'

const context = { authToken: 'AUTH_TOKEN' }

lab.beforeEach(() => {
  testLocationDetail = new LocationDetail(fakeLocationDetailData)

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(DynamicsDalService.prototype, 'create').value(() => testLocationDetailId)
  sandbox.stub(DynamicsDalService.prototype, 'update').value((dataObject) => dataObject.id)
  sandbox.stub(DynamicsDalService.prototype, 'search').value(() => {
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
  })
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
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
    const locationDetail = await LocationDetail.getByLocationId(context, fakeLocationDetailData.locationId)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(locationDetail.gridReference).to.equal(fakeLocationDetailData.gridReference)
  })

  lab.test('save() method saves a new LocationDetail object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await testLocationDetail.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testLocationDetail.id).to.equal(testLocationDetailId)
  })

  lab.test('save() method updates an existing LocationDetail object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    testLocationDetail.id = testLocationDetailId
    await testLocationDetail.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testLocationDetail.id).to.equal(testLocationDetailId)
  })
})
