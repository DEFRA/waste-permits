'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const StandardRule = require('../../../src/persistence/entities/standardRule.entity')
const ApplicationLine = require('../../../src/persistence/entities/applicationLine.entity')
const dynamicsDal = require('../../../src/services/dynamicsDal.service')

let sandbox
const context = { }

const fakeApplicationLine = {
  id: 'APPLICATION_LINE_ID',
  standardRuleId: 'STANDARD_RULE_ID',
  permitType: 910400000
}

const fakeStandardRule = {
  id: 'STANDARD_RULE_ID',
  permitName: 'STANDARD_RULE_NAME',
  selectionDisplayName: 'SELECTION_DISPLAY_NAME',
  displayOrder: 1,
  limits: 'STANDARD_RULE_LIMITS',
  code: 'SR2015 No 18',
  wamitabRiskLevel: 'WAMITAB_RISK_LEVEL',
  guidanceUrl: 'STANDARD_RULE_GUIDANCE_URL',
  canApplyFor: 'STANDARD_RULE_CAN_APPLY_FOR',
  canApplyOnline: 'STANDARD_RULE_CAN_APPLY_ONLINE',
  standardRuleTypeId: 'STANDARD_RULE_TYPE_ID'
}

const fakeDynamicsRecord = (options = {}) => {
  const standardRule = Object.assign({}, fakeStandardRule, options)
  return {
    defra_limits: standardRule.limits,
    defra_code: standardRule.code,
    defra_wamitabrisklevel: standardRule.wamitabRiskLevel,
    defra_rulesnamegovuk: standardRule.permitName,
    defra_nameinrulesetdocument: standardRule.selectionDisplayName,
    defra_displayorder: standardRule.displayOrder,
    defra_standardruleid: standardRule.id,
    defra_guidanceurl: standardRule.guidanceUrl,
    defra_canapplyfor: standardRule.canApplyFor,
    defra_canapplyonline: standardRule.canApplyOnline,
    _defra_standardruletypeid_value: standardRule.standardRuleTypeId
  }
}

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(dynamicsDal, 'search').value(() => {})
  sandbox.stub(ApplicationLine, 'getById').value(() => new ApplicationLine(fakeApplicationLine))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('StandardRule Entity tests:', () => {
  lab.test('list() method returns a list of StandardRule objects', async () => {
    const codes = ['SR2015 No 18', 'SR2015 No 10', 'SR2015 No 4']
    dynamicsDal.search = () => {
      return {
        value: [
          fakeDynamicsRecord({ code: codes[0] }),
          fakeDynamicsRecord({ code: codes[1] }),
          fakeDynamicsRecord({ code: codes[2] })]
      }
    }

    const spy = sinon.spy(dynamicsDal, 'search')
    const standardRuleList = await StandardRule.list(context)
    Code.expect(Array.isArray(standardRuleList)).to.be.true()
    Code.expect(standardRuleList.length).to.equal(3)
    standardRuleList.forEach((standardRule, index) => Code.expect(standardRule).to.equal(Object.assign({}, fakeStandardRule, { code: codes[index] })))
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('getByCode() method returns a StandardRule object', async () => {
    dynamicsDal.search = () => {
      return {
        value: [fakeDynamicsRecord()]
      }
    }

    const spy = sinon.spy(dynamicsDal, 'search')
    const standardRule = await StandardRule.getByCode(context)
    Code.expect(standardRule).to.equal(fakeStandardRule)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('getByApplicationId() method returns a single StandardRule object', async () => {
    dynamicsDal.search = () => fakeDynamicsRecord()

    const spy = sinon.spy(dynamicsDal, 'search')
    const standardRule = await StandardRule.getByApplicationLineId(context)
    Code.expect(standardRule).to.equal(fakeStandardRule)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('save() method should fail as this entity is readOnly', async () => {
    let error
    try {
      const standardRule = new StandardRule(fakeStandardRule)
      await standardRule.save()
    } catch (err) {
      error = err
    }
    Code.expect(error.message).to.equal('Unable to save defra_standardrules: Read only!')
  })
})
