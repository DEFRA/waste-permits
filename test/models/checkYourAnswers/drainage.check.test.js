'use strict'

const Merge = require('deepmerge')
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkYourAnswers/base.check')
const DrainageCheck = require('../../../src/models/checkYourAnswers/drainage.check')

const fakeApplication = {
  drainageType: 910400000
}

const prefix = 'section-drainage'
let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox to prevent the "spy already wrapped errors" when a "spy.calledWith" fails
  sandbox = sinon.createSandbox()
  sandbox.stub(BaseCheck.prototype, 'getApplication').value(() => Merge({}, fakeApplication))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Drainage Check tests:', () => {
  lab.test('buildlines works correctly', async () => {
    const check = new DrainageCheck()
    const lines = await check.buildLines()
    const { heading, headingId, answers, links } = lines.pop()

    Code.expect(heading).to.equal(heading)
    Code.expect(headingId).to.equal(`${prefix}-heading`)

    const { answer, answerId } = answers.pop()
    Code.expect(answer).to.equal('Drains to a sewer under a consent from the local water company')
    Code.expect(answerId).to.equal(`${prefix}-answer`)

    const { link, linkId, linkType } = links.pop()
    Code.expect(link).to.equal('/drainage-type/drain')
    Code.expect(linkType).to.equal('drainage system')
    Code.expect(linkId).to.equal(`${prefix}-link`)
  })
})
