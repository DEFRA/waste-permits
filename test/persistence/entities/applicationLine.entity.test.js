'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const ApplicationLine = require('../../../src/persistence/entities/applicationLine.entity')
const dynamicsDal = require('../../../src/services/dynamicsDal.service')

let fakeApplicationLine
let fakeParameterId
let fakeRulesId
let sandbox
let searchSpy
let createSpy

const context = { }
const applicationLineId = 'APPLICATION_LINE_ID'

lab.beforeEach(() => {
  fakeParameterId = 'PARAMETER_ID'
  fakeRulesId = 'defra_confirmreadrules'
  fakeApplicationLine = new ApplicationLine({
    applicationId: 'APPLICATION_ID',
    standardRuleId: 'STANDARD_RULE_ID',
    parametersId: {
      [fakeParameterId]: true,
      [fakeRulesId]: true
    }
  })

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  createSpy = sandbox.stub(dynamicsDal, 'create')
  createSpy.resolves(applicationLineId)
  searchSpy = sandbox.stub(dynamicsDal, 'search')
  searchSpy.resolves({
    // Dynamics ApplicationLine objects
    _defra_standardruleid_value: fakeApplicationLine.standardRuleId,
    _defra_parametersid_value: fakeParameterId,
    defra_parametersId: fakeApplicationLine.parametersId,
    _defra_applicationid_value: fakeApplicationLine.applicationId
  })
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('ApplicationLine Entity tests:', () => {
  lab.test('getById() method correctly retrieves an ApplicationLine object', async () => {
    const applicationLine = await ApplicationLine.getById(context, applicationLineId)
    Code.expect(searchSpy.callCount).to.equal(1)
    Code.expect(applicationLine.applicationId).to.equal(fakeApplicationLine.applicationId)
    Code.expect(applicationLine.standardRuleId).to.equal(fakeApplicationLine.standardRuleId)
    Code.expect(applicationLine.parametersId).to.equal(fakeParameterId)
    Code.expect(applicationLine.id).to.equal(applicationLineId)
  })

  lab.test('listForWasteActivities() method correctly retrieves a list of ApplicationLine objects for waste activities', async () => {
    searchSpy.resolves({
      value: [{
        // Dynamics ApplicationLine objects
        defra_applicationlineid: applicationLineId,
        _defra_standardruleid_value: fakeApplicationLine.standardRuleId,
        _defra_parametersid_value: fakeParameterId,
        defra_parametersId: fakeApplicationLine.parametersId,
        _defra_applicationid_value: fakeApplicationLine.applicationId
      }]
    })
    const applicationLines = await ApplicationLine.listForWasteActivities(context)
    Code.expect(searchSpy.callCount).to.equal(1)
    Code.expect(applicationLines.length).to.equal(1)
    const applicationLine = applicationLines[0]
    Code.expect(applicationLine.applicationId).to.equal(fakeApplicationLine.applicationId)
    Code.expect(applicationLine.standardRuleId).to.equal(fakeApplicationLine.standardRuleId)
    Code.expect(applicationLine.parametersId).to.equal(fakeParameterId)
    Code.expect(applicationLine.id).to.equal(applicationLineId)
  })

  lab.test('save() method saves a new ApplicationLine object', async () => {
    await fakeApplicationLine.save(context)
    Code.expect(createSpy.callCount).to.equal(1)
    Code.expect(fakeApplicationLine.id).to.equal(applicationLineId)
  })
})
