'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const Location = require('../../../src/persistence/entities/location.entity')
const dynamicsDal = require('../../../src/services/dynamicsDal.service')

let sandbox

let testLocation
const fakeLocationData = {
  siteName: 'THE_SITE_NAME',
  applicationId: 'APPLICATION_ID'
}
const testLocationId = 'LOCATION_ID'

let context
const applicationId = fakeLocationData.applicationId
const applicationLineId = 'APPLICATION_LINE_ID'

lab.beforeEach(() => {
  testLocation = new Location(fakeLocationData)

  context = {
    authToken: 'AUTH_TOKEN',
    applicationId,
    applicationLineId
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(dynamicsDal, 'create').value(() => testLocationId)
  sandbox.stub(dynamicsDal, 'update').value(() => testLocationId)
  sandbox.stub(dynamicsDal, 'search').value(() => {
    // Dynamics Location object
    return {
      '@odata.context': 'THE_ODATA_ENDPOINT_AND_QUERY',
      value: [{
        '@odata.etag': 'W/"1234567"',
        defra_name: fakeLocationData.siteName,
        defra_locationid: fakeLocationData.applicationId
      }]
    }
  })
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Location Entity tests:', () => {
  lab.test('Constructor creates a Location object correctly', () => {
    const emptyLocation = new Location({})
    Code.expect(emptyLocation.siteName).to.be.undefined()

    Code.expect(testLocation.siteName).to.equal(fakeLocationData.siteName)
    Code.expect(testLocation.applicationId).to.equal(fakeLocationData.applicationId)
  })

  lab.test('getByApplicationId() method returns a single Location object', async () => {
    const spy = sinon.spy(dynamicsDal, 'search')
    const site = await Location.getByApplicationId(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(site.siteName).to.equal(fakeLocationData.siteName)
  })

  lab.test('save() method saves a new Location object', async () => {
    const spy = sinon.spy(dynamicsDal, 'create')
    await testLocation.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testLocation.id).to.equal(testLocationId)
  })

  lab.test('save() method updates an existing Location object', async () => {
    const spy = sinon.spy(dynamicsDal, 'update')
    testLocation.id = testLocationId
    await testLocation.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testLocation.id).to.equal(testLocationId)
  })
})
