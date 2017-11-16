'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Address = require('../../src/models/address.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let dynamicsCreateStub
let dynamicsSearchStub
let dynamicsUpdateStub

let testAddress
const fakeAddressData = {
  postcode: 'BS1 5AH'
}

const testAddressId = 'ADDRESS_ID'

const authToken = 'THE_AUTH_TOKEN'

lab.beforeEach(() => {
  testAddress = new Address(fakeAddressData)

  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = (query) => {
    // Dynamics Address object
    return {
      '@odata.context': 'https://ea-lp-crm-devmaster.crm4.dynamics.com/api/data/v8.2/$metadata#defra_addresses/$entity',
      '@odata.etag': 'W/"881141"',
      'defra_fromaddresslookup@OData.Community.Display.V1.FormattedValue': 'No',
      defra_fromaddresslookup: false,
      '_owningbusinessunit_value@OData.Community.Display.V1.FormattedValue': null,
      _owningbusinessunit_value: 'd0e1178d-8193-e711-8111-5065f38a6ad1',
      'statecode@OData.Community.Display.V1.FormattedValue': 'Active',
      statecode: 0,
      'statuscode@OData.Community.Display.V1.FormattedValue': 'Active',
      statuscode: 1,
      defra_name: '  BS1 5AH ',
      '_createdby_value@OData.Community.Display.V1.FormattedValue': 'Waste Sys Ops',
      _createdby_value: '10b88e9b-abaa-e711-8114-5065f38a3b21',
      'createdon@OData.Community.Display.V1.FormattedValue': '11/10/2017 6:11 PM',
      createdon: '2017-11-10T18:11:13Z',
      defra_addressid: testAddressId,
      '_ownerid_value@OData.Community.Display.V1.FormattedValue': 'Waste Sys Ops',
      _ownerid_value: '10b88e9b-abaa-e711-8114-5065f38a3b21',
      defra_postcode: fakeAddressData.postcode,
      'modifiedon@OData.Community.Display.V1.FormattedValue': '11/10/2017 6:11 PM',
      modifiedon: '2017-11-10T18:11:13Z',
      '_owninguser_value@OData.Community.Display.V1.FormattedValue': null,
      _owninguser_value: '10b88e9b-abaa-e711-8114-5065f38a3b21',
      '_modifiedby_value@OData.Community.Display.V1.FormattedValue': 'Waste Sys Ops',
      _modifiedby_value: '10b88e9b-abaa-e711-8114-5065f38a3b21',
      'versionnumber@OData.Community.Display.V1.FormattedValue': '881,141',
      versionnumber: 881141,
      defra_towntext: null,
      _owningteam_value: null,
      defra_y: null,
      defra_street: null,
      defra_locality: null,
      defra_x: null,
      _defra_country_value: null,
      timezoneruleversionnumber: null,
      importsequencenumber: null,
      utcconversiontimezonecode: null,
      _createdonbehalfby_value: null,
      overriddencreatedon: null,
      defra_uprn: null,
      defra_premises: null,
      _defra_town_value: null,
      _modifiedonbehalfby_value: null
    }
  }

  dynamicsCreateStub = DynamicsDalService.prototype.create
  DynamicsDalService.prototype.create = (dataObject, query) => testAddressId

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = (dataObject, query) => dataObject.id
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.create = dynamicsCreateStub
  DynamicsDalService.prototype.search = dynamicsSearchStub
  DynamicsDalService.prototype.update = dynamicsUpdateStub
})

lab.experiment('Address Model tests:', () => {
  lab.test('Constructor creates a Address object correctly', () => {
    const emptyAddress = new Address({})
    Code.expect(emptyAddress.postcode).to.be.undefined()

    Code.expect(testAddress.postcode).to.equal(fakeAddressData.postcode)
    Code.expect(testAddress.locationId).to.equal(fakeAddressData.locationId)
  })

  lab.test('getById() method returns a single Address object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const address = await Address.getById(authToken, testAddressId)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(address.postcode).to.equal(fakeAddressData.postcode)
  })

  lab.test('save() method saves a new Address object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await testAddress.save()
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testAddress.id).to.equal(testAddressId)
  })

  lab.test('save() method updates an existing Address object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    testAddress.id = testAddressId
    await testAddress.save()
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testAddress.id).to.equal(testAddressId)
  })
})
