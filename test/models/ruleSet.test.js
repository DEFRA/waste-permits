'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')

const featureConfig = require('../../src/config/featureConfig')
const Application = require('../../src/persistence/entities/application.entity')
const ApplicationLine = require('../../src/persistence/entities/applicationLine.entity')
const RuleSet = require('../../src/models/ruleSet.model')
const dynamicsDal = require('../../src/services/dynamicsDal.service')

let fakeApplicationLine
let fakeParametersId
let context
let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  context = mocks.context

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
  sandbox.stub(featureConfig, 'hasBespokeFeature').value(true)
  sandbox.stub(dynamicsDal, 'search').value(() => searchResult)
  sandbox.stub(Application, 'getById').callsFake(() => mocks.application)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('RuleSet Model tests:', () => {
  lab.test('getValidRuleSetIds() method correctly retrieves the completed flag from the ApplicationLine object for the specified parameter', async () => {
    const spy = sinon.spy(dynamicsDal, 'search')
    const ruleSetIds = await RuleSet.getValidRuleSetIds(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(ruleSetIds).to.include(Object.keys(fakeParametersId))
    Code.expect(ruleSetIds.length).to.equal(Object.keys(fakeParametersId).length)
  })
})
