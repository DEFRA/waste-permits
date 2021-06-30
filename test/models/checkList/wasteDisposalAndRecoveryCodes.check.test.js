'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkList/base.check')
const WasteDisposalAndRecoveryCodesCheck = require('../../../src/models/checkList/wasteDisposalAndRecoveryCodes.check')

const prefix = 'section-waste-rd'

let sandbox
let stub

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()
  stub = sandbox.stub(BaseCheck.prototype, 'getAllWasteDisposalAndRecoveryCodes')
  stub.resolves([{ combinedSelectedCodesForDisplay: ['D1', 'R1'] }, { combinedSelectedCodesForDisplay: ['D2', 'R2'] }])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Waste Disposal and Recovery Codes Check tests:', () => {
  lab.test('buildlines works correctly', async () => {
    const check = new WasteDisposalAndRecoveryCodesCheck()
    const lines = await check.buildLines()

    const { heading, headingId, answers, links } = lines.pop()

    Code.expect(heading).to.equal('D and R codes')
    Code.expect(headingId).to.equal(`${prefix}-heading`)

    const { answer, answerId } = answers.pop()

    Code.expect(answer).to.equal('D1, R1; D2, R2')
    Code.expect(answerId).to.equal(`${prefix}-answer`)

    const { link, linkId, linkType } = links.pop()
    Code.expect(link).to.equal('/recovery-disposal')
    Code.expect(linkType).to.equal('disposal and recovery codes')
    Code.expect(linkId).to.equal(`${prefix}-link`)
  })

  lab.test('Provides the correct task', async () => {
    Code.expect(WasteDisposalAndRecoveryCodesCheck.task.id).to.equal('recovery-and-disposal-codes')
  })
})
