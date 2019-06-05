'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const Address = require('../../../src/persistence/entities/address.entity')
const DynamicsDalService = require('../../../src/services/dynamicsDal.service')

let sandbox

let testAddress
const fakeAddressData = {
  uprn: 'UPRN_123456',
  fromAddressLookup: true,
  buildingNameOrNumber: '123',
  addressLine1: 'THE STREET',
  addressLine2: 'THE DISTRICT',
  townOrCity: 'TEST TOWN',
  postcode: 'BS1 5AH'
}

const fakeFullAddress = (address) => {
  return [
    address.buildingNameOrNumber,
    address.addressLine1,
    address.addressLine2,
    address.townOrCity,
    address.postcode
  ].filter((item) => item).join(', ')
}

const testAddressId = 'ADDRESS_ID'

const context = { authToken: 'AUTH_TOKEN' }

lab.beforeEach(() => {
  testAddress = new Address(fakeAddressData)

  const searchResult = {
    // Dynamics Address object
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

  const postcodeLookupResult = {
    '@odata.context': 'https://ea-lp-crm-devmaster.crm4.dynamics.com/api/data/v8.2/$metadata#Microsoft.Dynamics.CRM.defra_postcodelookupResponse',
    addresses: '{"header":{"totalMatches":3,"startMatch":1,"endMatch":3,"query":"postcode=BS1 5AH","language":"EN","dataset":"DPA","epoch":"55","uriToSupplier":"https://api.ordnancesurvey.co.uk/places/v1/addresses/postcode?lr=EN&postcode=BS1%205AH&fq=logical_status_code%3A1&dataset=DPA","uriFromClient":"http://ea-addressfacade1081.cloudapp.net/address-service/v1/addresses/postcode?query-string=BS1%205AH"},"results":[{"uprn":340116,"address":"NATURAL ENGLAND, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH","organisation":"NATURAL ENGLAND","premises":"HORIZON HOUSE","street_address":"DEANERY ROAD","locality":null,"city":"BRISTOL","postcode":"BS1 5AH","country":"United Kingdom","x":358205.03,"y":172708.06,"coordinate_system":null,"blpu_state_date":"12/10/2009","blpu_state_code":2,"postal_address_code":"D","logical_status_code":1,"source_data_type":"dpa","blpu_state_code_description":"In use","classification_code":"CO01","classification_code_description":"Office / Work Studio","lpi_logical_status_code":null,"lpi_logical_status_code_description":null,"match":1.0,"match_description":"EXACT","topography_layer_toid":"osgb1000002529079737","parent_uprn":null,"last_update_date":"10/02/2016","status":"APPROVED","entry_date":"12/10/2009","postal_address_code_description":"A record which is linked to PAF","usrn":null,"language":"EN"},{"uprn":10091760640,"address":"HARMSEN GROUP, TRIODOS BANK, DEANERY ROAD, BRISTOL, BS1 5AH","organisation":"HARMSEN GROUP","premises":"TRIODOS BANK","street_address":"DEANERY ROAD","locality":null,"city":"BRISTOL","postcode":"BS1 5AH","country":"United Kingdom","x":358130.1,"y":172687.88,"coordinate_system":null,"blpu_state_date":null,"blpu_state_code":null,"postal_address_code":"D","logical_status_code":1,"source_data_type":"dpa","blpu_state_code_description":"Unknown/Not applicable","classification_code":"OR04","classification_code_description":"Additional Mail / Packet Addressee","lpi_logical_status_code":null,"lpi_logical_status_code_description":null,"match":1.0,"match_description":"EXACT","topography_layer_toid":"osgb1000002529079753","parent_uprn":340117,"last_update_date":"10/02/2016","status":"APPROVED","entry_date":"20/06/2012","postal_address_code_description":"A record which is linked to PAF","usrn":null,"language":"EN"},{"uprn":340117,"address":"THRIVE RENEWABLES PLC, DEANERY ROAD, BRISTOL, BS1 5AH","organisation":"THRIVE RENEWABLES PLC","premises":null,"street_address":"DEANERY ROAD","locality":null,"city":"BRISTOL","postcode":"BS1 5AH","country":"United Kingdom","x":358130.1,"y":172687.88,"coordinate_system":null,"blpu_state_date":"12/10/2009","blpu_state_code":2,"postal_address_code":"D","logical_status_code":1,"source_data_type":"dpa","blpu_state_code_description":"In use","classification_code":"CO01","classification_code_description":"Office / Work Studio","lpi_logical_status_code":null,"lpi_logical_status_code_description":null,"match":1.0,"match_description":"EXACT","topography_layer_toid":"osgb1000002529079753","parent_uprn":null,"last_update_date":"26/03/2017","status":"APPROVED","entry_date":"12/10/2009","postal_address_code_description":"A record which is linked to PAF","usrn":null,"language":"EN"}]}'
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(DynamicsDalService.prototype, 'create').value(() => testAddressId)
  sandbox.stub(DynamicsDalService.prototype, 'update').value((dataObject) => dataObject.id)
  sandbox.stub(DynamicsDalService.prototype, 'search').value(() => searchResult)
  sandbox.stub(DynamicsDalService.prototype, 'callAction').value(() => postcodeLookupResult)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Address Entity tests:', () => {
  lab.test('Constructor creates a Address object correctly', () => {
    const emptyAddress = new Address({})
    Code.expect(emptyAddress.postcode).to.be.undefined()

    Code.expect(testAddress.postcode).to.equal(fakeAddressData.postcode)
    Code.expect(testAddress.locationId).to.equal(fakeAddressData.locationId)
  })

  lab.test('getById() method returns a single Address object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const address = await Address.getById(context, testAddressId)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(address.postcode).to.equal(fakeAddressData.postcode)
  })

  lab.test('getByUprn() method returns a single Address object', async () => {
    const responseData = {
      '@odata.context': 'https://ea-lp-crm-devmaster.crm4.dynamics.com/api/data/v8.2/$metadata#defra_addresses(defra_addressid,defra_premises,defra_street,defra_locality,defra_towntext,defra_postcode,defra_uprn,defra_fromaddresslookup)',
      value: [{
        '@odata.etag': 'W/"123456"',
        defra_addressid: 'ADDRESS_ID',
        defra_premises: 'HORIZON HOUSE',
        defra_street: 'DEANERY ROAD',
        defra_locality: null,
        defra_towntext: 'BRISTOL',
        defra_postcode: 'BS1 5AH',
        defra_uprn: fakeAddressData.uprn,
        'defra_fromaddresslookup@OData.Community.Display.V1.FormattedValue': 'Yes',
        defra_fromaddresslookup: true
      }]
    }
    DynamicsDalService.prototype.search = () => {
      // Dynamics Address object
      return responseData
    }

    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const address = await Address.getByUprn(context, fakeAddressData.uprn)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(address.uprn).to.equal(fakeAddressData.uprn)
  })

  lab.test('listByPostcode() method returns a collection of Address objects', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'callAction')
    const addresses = await Address.listByPostcode(context, fakeAddressData.postcode)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(addresses.length).to.equal(3)
  })

  lab.test('save() method saves a new Address object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await testAddress.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testAddress.id).to.equal(testAddressId)
  })

  lab.test('save() method updates an existing Address object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    testAddress.id = testAddressId
    await testAddress.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testAddress.id).to.equal(testAddressId)
  })

  lab.experiment('save() method creates the name (fullAddress) property correctly for manually created addresses', () => {
    lab.beforeEach(async () => {
      testAddress.fromAddressLookup = false
      testAddress.fullAddress = undefined
    })

    lab.test('when all address fields are filled in', async () => {
      await testAddress.save(context)
      Code.expect(testAddress.fullAddress).to.equal(fakeFullAddress(testAddress))
    })

    lab.test('when not all address fields are filled in', async () => {
      testAddress.addressLine2 = undefined
      testAddress.postcode = undefined
      await testAddress.save(context)
      Code.expect(testAddress.fullAddress).to.equal(fakeFullAddress(testAddress))
    })
  })
})
