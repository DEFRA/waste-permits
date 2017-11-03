'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const ApplicationLine = require('../../src/models/applicationLine.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let fakeApplicationLine
let dynamicsCreateStub
let dynamicsSearchStub

let applicationLineId = 'APPLICATION_LINE_ID'

lab.beforeEach(() => {
  // testApplication = new ApplicationLine()
  fakeApplicationLine = new ApplicationLine({
    applicationId: 'APPLICATION_ID',
    standardRuleId: 'STANDARD_RULE_ID',
    parametersId: 'PARAMTERS_ID'
  })

  // Stub methods

  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = (query) => {
    // Dynamics Contact objects
    return {
      '@odata.context': 'THE_ODATA_ENDPOINT_AND_QUERY',
      '@odata.etag': 'W/"1234567"',
      'versionnumber@OData.Community.Display.V1.FormattedValue': '861,994',
      versionnumber: 861994,
      '_owningbusinessunit_value@OData.Community.Display.V1.FormattedValue': null,
      _owningbusinessunit_value: 'd0e1178d-8193-e711-8111-5065f38a6ad1',
      'statecode@OData.Community.Display.V1.FormattedValue': 'Active',
      statecode: 0,
      'statuscode@OData.Community.Display.V1.FormattedValue': 'Active',
      statuscode: 1,
      'defra_permittype@OData.Community.Display.V1.FormattedValue': 'Standard',
      defra_permittype: 910400000,
      '_defra_standardruleid_value@OData.Community.Display.V1.FormattedValue': 'SR2015 No 18',
      _defra_standardruleid_value: fakeApplicationLine.standardRuleId,
      '_createdby_value@OData.Community.Display.V1.FormattedValue': 'Waste Sys Ops',
      _createdby_value: '10b88e9b-abaa-e711-8114-5065f38a3b21',
      defra_applicationlineid: 'd4756eed-a4c0-e711-811c-5065f38ac931',
      '_ownerid_value@OData.Community.Display.V1.FormattedValue': 'Waste Sys Ops',
      _ownerid_value: '10b88e9b-abaa-e711-8114-5065f38a3b21',
      'modifiedon@OData.Community.Display.V1.FormattedValue': '11/3/2017 2:40 PM',
      modifiedon: '2017-11-03T14:40:32Z',
      '_modifiedby_value@OData.Community.Display.V1.FormattedValue': 'Waste Sys Ops',
      _modifiedby_value: '10b88e9b-abaa-e711-8114-5065f38a3b21',
      '_owninguser_value@OData.Community.Display.V1.FormattedValue': null,
      _owninguser_value: '10b88e9b-abaa-e711-8114-5065f38a3b21',
      'createdon@OData.Community.Display.V1.FormattedValue': '11/3/2017 2:40 PM',
      createdon: '2017-11-03T14:40:32Z',
      '_defra_parametersid_value@OData.Community.Display.V1.FormattedValue': 'Application Completion',
      _defra_parametersid_value: fakeApplicationLine.parametersId,
      '_defra_applicationid_value@OData.Community.Display.V1.FormattedValue': 'AB139CD',
      _defra_applicationid_value: fakeApplicationLine.applicationId,
      utcconversiontimezonecode: null,
      _createdonbehalfby_value: null,
      _modifiedonbehalfby_value: null,
      defra_name: null,
      defra_tonnesperannum: null,
      overriddencreatedon: null,
      _owningteam_value: null,
      _defra_facilityid_value: null,
      timezoneruleversionnumber: null,
      importsequencenumber: null
    }
  }

  dynamicsCreateStub = DynamicsDalService.prototype.create
  DynamicsDalService.prototype.create = (dataObject, query) => {
    return applicationLineId
  }
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.create = dynamicsCreateStub
  DynamicsDalService.prototype.search = dynamicsSearchStub
})

lab.experiment('ApplicationLine Model tests:', () => {
  lab.test('getById() method correctly retrieves an ApplicationLine object', async() => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const applicationLine = await ApplicationLine.getById('AUTH_TOKEN', applicationLineId)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(applicationLine.applicationId).to.equal(fakeApplicationLine.applicationId)
    Code.expect(applicationLine.standardRuleId).to.equal(fakeApplicationLine.standardRuleId)
    Code.expect(applicationLine.parametersId).to.equal(fakeApplicationLine.parametersId)
    Code.expect(applicationLine.id).to.equal(applicationLineId)
  })

  lab.test('save() method saves a new ApplicationLine object', async() => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await fakeApplicationLine.save()
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(fakeApplicationLine.id).to.equal(applicationLineId)
  })
})
