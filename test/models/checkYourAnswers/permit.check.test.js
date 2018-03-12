'use strict'

const Merge = require('deepmerge')
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkYourAnswers/base.check')
const PermitCheck = require('../../../src/models/checkYourAnswers/permit.check')

const fakeStandardRule = {
  code: 'STANDARD_RULE_CODE',
  permitName: 'STANDARD_RULE_NAME'
}

const prefix = 'section-permit'
let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox to prevent the "spy already wrapped errors" when a "spy.calledWith" fails
  sandbox = sinon.createSandbox()
  sandbox.stub(BaseCheck.prototype, 'getStandardRule').value(() => Merge({}, fakeStandardRule))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Permit Check tests:', () => {
  lab.test('buildlines works correctly', async () => {
    const check = new PermitCheck()
    const lines = await check.buildLines()
    const {heading, headingId, answers, links} = lines.pop()

    Code.expect(heading).to.equal(heading)
    Code.expect(headingId).to.equal(`${prefix}-heading`)

    const {answer, answerId} = answers.pop()
    const {code, permitName} = fakeStandardRule
    Code.expect(answer).to.equal(`${permitName} ${code}`)
    Code.expect(answerId).to.equal(`${prefix}-answer`)

    const {link, linkId, linkType} = links.pop()
    Code.expect(link).to.equal('/permit/category')
    Code.expect(linkType).to.equal('contact details')
    Code.expect(linkId).to.equal(`${prefix}-link`)
  })
})
