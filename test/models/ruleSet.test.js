'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')

const Application = require('../../src/persistence/entities/application.entity')
const ApplicationLine = require('../../src/persistence/entities/applicationLine.entity')
const DataStore = require('../../src/models/dataStore.model')
const RuleSet = require('../../src/models/ruleSet.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let fakeApplicationLine
let fakeParametersId
let context
let applicationLineId
let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  context = { authToken: 'AUTH_TOKEN' }
  applicationLineId = 'APPLICATION_LINE_ID'

  fakeParametersId = {
    defra_confirmreadrules: true,
    defra_cnfconfidentialityreq: true,
    defra_contactdetailsrequired: true,
    defra_showcostandtime: true
  }

  fakeApplicationLine = new ApplicationLine({
    applicationId: 'APPLICATION_ID',
    standardRuleId: 'STANDARD_RULE_ID',
    parametersId: fakeParametersId
  })

  const searchResult = {
    _defra_standardruleid_value: fakeApplicationLine.standardRuleId,
    defra_parametersId: fakeApplicationLine.parametersId,
    _defra_applicationid_value: fakeApplicationLine.applicationId
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(DynamicsDalService.prototype, 'search').value(() => searchResult)
  sandbox.stub(Application, 'getById').callsFake(() => mocks.application)
  sandbox.stub(DataStore, 'get').callsFake(() => mocks.dataStore)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('RuleSet Model tests:', () => {
  lab.test('getValidRuleSetIds() method correctly retrieves the completed flag from the ApplicationLine object for the specified parameter', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const ruleSetIds = await RuleSet.getValidRuleSetIds(context, applicationLineId)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(ruleSetIds).to.include(Object.keys(fakeParametersId))
    Code.expect(ruleSetIds.length).to.equal(Object.keys(fakeParametersId).length)
  })
})
