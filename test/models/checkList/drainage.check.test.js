'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const BaseCheck = require('../../../src/models/checkList/base.check')
const DrainageCheck = require('../../../src/models/checkList/drainage.check')

const prefix = 'section-drainage'
let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to prevent the "spy already wrapped errors" when a "spy.calledWith" fails
  sandbox = sinon.createSandbox()
  sandbox.stub(BaseCheck.prototype, 'getApplication').value(async () => mocks.application)
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
