'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const StandardRule = require('../../src/models/standardRule.model')
const ApplicationLine = require('../../src/models/applicationLine.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let dynamicsSearchStub
let applicationLineGetByIdStub

const fakeStandardRule = {
  id: 'STANDARD_RULE_ID',
  name: 'STANDARD_RULE_NAME',
  limits: 'STANDARD_RULE_LIMITS',
  _entity: 'defra_standardrules',
  code: 'SR2015 No 18',
  codeForId: 'sr2015-no-18',
  guidanceUrl: 'STANDARD_RULE_GUIDANCE_URL'
}

const fakeDynamicsRecord = (options = {}) => {
  const standardRule = Object.assign({}, fakeStandardRule, options)
  return {
    defra_limits: standardRule.limits,
    defra_code: standardRule.code,
    defra_rulesnamegovuk: standardRule.name,
    defra_standardruleid: standardRule.id,
    defra_guidanceurl: standardRule.guidanceUrl
  }
}

lab.beforeEach(() => {
  // Stub methods
  dynamicsSearchStub = DynamicsDalService.prototype.search

  applicationLineGetByIdStub = ApplicationLine.getById
  ApplicationLine.getById = () => ({standardRuleId: 'STANDARD_RULE_ID'})
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.search = dynamicsSearchStub
  ApplicationLine.getById = applicationLineGetByIdStub
})

lab.experiment('StandardRule Model tests:', () => {
  lab.test('list() method returns a list of StandardRule objects', async () => {
    const codes = ['SR2015 No 18', 'SR2015 No 10', 'SR2015 No 4']
    DynamicsDalService.prototype.search = () => {
      return {
        value: [
          fakeDynamicsRecord({code: codes[0], codeForId: StandardRule.transformPermitCode(codes[0])}),
          fakeDynamicsRecord({code: codes[1], codeForId: StandardRule.transformPermitCode(codes[1])}),
          fakeDynamicsRecord({code: codes[2], codeForId: StandardRule.transformPermitCode(codes[2])})]
      }
    }

    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const standardRuleList = await StandardRule.list()
    Code.expect(Array.isArray(standardRuleList)).to.be.true()
    Code.expect(standardRuleList.length).to.equal(3)
    standardRuleList.forEach((standardRule, index) => {
      Code.expect(standardRule).to.equal(Object.assign({}, fakeStandardRule, {code: codes[index], codeForId: StandardRule.transformPermitCode(codes[index])}))
    })
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('getByCode() method returns a StandardRule object', async () => {
    DynamicsDalService.prototype.search = () => {
      return {
        value: [fakeDynamicsRecord()]
      }
    }

    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const standardRule = await StandardRule.getByCode()
    Code.expect(standardRule).to.equal(fakeStandardRule)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('getByApplicationId() method returns a single StandardRule object', async () => {
    DynamicsDalService.prototype.search = () => fakeDynamicsRecord()

    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const standardRule = await StandardRule.getByApplicationLineId()
    Code.expect(standardRule).to.equal(fakeStandardRule)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('transformPermitCode() method formats string for an ID correctly', () => {
    const string = 'SR2015 No 10'
    Code.expect(StandardRule.transformPermitCode(string)).to.equal('sr2015-no-10')
  })
})
