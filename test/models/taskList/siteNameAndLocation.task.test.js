'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const DynamicsDalService = require('../../../src/services/dynamicsDal.service')
const Location = require('../../../src/persistence/entities/location.entity')
const LocationDetail = require('../../../src/persistence/entities/locationDetail.entity')
const Address = require('../../../src/persistence/entities/address.entity')
const SiteNameAndLocation = require('../../../src/models/taskList/siteNameAndLocation.task')

let sandbox
let request
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  request = mocks.request

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(DynamicsDalService.prototype, 'create').value(async () => mocks.address.id)
  sandbox.stub(DynamicsDalService.prototype, 'update').value((dataObject) => dataObject.id)
  sandbox.stub(Location, 'getByApplicationId').value(async () => mocks.location)
  sandbox.stub(Location.prototype, 'save').value(async () => undefined)
  sandbox.stub(LocationDetail, 'getByLocationId').value(async () => mocks.locationDetail)
  sandbox.stub(LocationDetail.prototype, 'save').value(async () => undefined)
  sandbox.stub(Address, 'getById').value(async () => mocks.address)
  sandbox.stub(Address, 'getByUprn').value(async () => mocks.address)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const testCompleteness = async (obj, expectedResult) => {
  mocks.location.siteName = obj.siteName
  mocks.locationDetail.gridReference = obj.gridReference
  mocks.address.postcode = obj.postcode
  const result = await SiteNameAndLocation.isComplete(mocks.context)
  Code.expect(result).to.equal(expectedResult)
}

lab.experiment('Task List: Site Name and Location Model tests:', () => {
  lab.test('getSiteName() method correctly retrieves undefined site name when there is no saved Location', async () => {
    Location.getByApplicationId = () => {
      return undefined
    }

    const result = await SiteNameAndLocation.getSiteName(request)
    Code.expect(result).to.be.equal(undefined)
  })

  lab.test('getSiteName() method correctly retrieves a site name when there is a saved Location', async () => {
    const result = await SiteNameAndLocation.getSiteName(request)
    Code.expect(result).to.be.equal(mocks.location.siteName)
  })

  lab.test('saveSiteName() method correctly saves a site name', async () => {
    const spy = sinon.spy(Location.prototype, 'save')
    const appContext = {}
    await SiteNameAndLocation.saveSiteName(request, mocks.location.siteName, appContext)
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
    Code.expect(result).to.be.equal(mocks.locationDetail.gridReference)
  })

  lab.test('saveGridReference() method correctly saves a grid reference', async () => {
    const spy = sinon.spy(LocationDetail.prototype, 'save')
    await SiteNameAndLocation.saveGridReference(request, mocks.locationDetail.gridReference)
    Code.expect(spy.callCount).to.equal(1)
  })
  lab.experiment('Model persistence methods:', () => {
    lab.test('getAddress() method correctly retrieves an Address', async () => {
      const address = await SiteNameAndLocation.getAddress(request)
      Code.expect(address.uprn).to.be.equal(mocks.address.uprn)
    })

    lab.test('saveManualAddress() method correctly creates an site address from a selected address that is already in Dynamics', async () => {
      const addressDto = {
        uprn: mocks.address.uprn,
        postcode: mocks.address.postcode
      }
      const spy = sinon.spy(LocationDetail.prototype, 'save')
      await SiteNameAndLocation.saveManualAddress(request, addressDto)
      Code.expect(spy.callCount).to.equal(1)
    })

    lab.test('saveManualAddress() method correctly saves an site address that is not already in Dynamics', async () => {
      Address.getByUprn = () => undefined
      const addressDto = {
        postcode: mocks.address.postcode
      }
      const spy = sinon.spy(LocationDetail.prototype, 'save')
      await SiteNameAndLocation.saveManualAddress(request, addressDto)
      Code.expect(spy.callCount).to.equal(1)
    })
  })

  lab.test('isComplete() method correctly returns TRUE when the task list item is complete', async () => {
    const result = await SiteNameAndLocation.isComplete(mocks.context)
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
