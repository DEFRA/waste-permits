'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const BaseCheck = require('../../../src/models/checkList/base.check')
const PermitCheck = require('../../../src/models/checkList/standardRulesPermit.check')

const prefix = 'section-permit'
let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to prevent the "spy already wrapped errors" when a "spy.calledWith" fails
  sandbox = sinon.createSandbox()
  sandbox.stub(BaseCheck.prototype, 'getStandardRule').value(async () => mocks.standardRule)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Standard Rules Permit Check tests:', () => {
  lab.test('buildlines works correctly', async () => {
    const check = new PermitCheck()
    const lines = await check.buildLines()
    const { heading, headingId, answers, links } = lines.pop()

    Code.expect(heading).to.equal(heading)
    Code.expect(headingId).to.equal(`${prefix}-heading`)

    const { answer, answerId } = answers.pop()
    const { code, permitName } = mocks.standardRule
    Code.expect(answer).to.equal(`${permitName} ${code}`)
    Code.expect(answerId).to.equal(`${prefix}-answer`)

    const { link, linkId, linkType } = links.pop()
    Code.expect(link).to.equal('/bespoke-or-standard-rules')
    Code.expect(linkType).to.equal('contact details')
    Code.expect(linkId).to.equal(`${prefix}-link`)
  })
})
