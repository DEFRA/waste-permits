'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkList/base.check')
const WasteWeightsCheck = require('../../../src/models/checkList/wasteWeights.check')

const prefix = 'section-waste-weights'

let sandbox
let stub

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()
  stub = sandbox.stub(BaseCheck.prototype, 'getAllWasteWeights')
  stub.resolves([{ listOfWeights: ['1', '2'] }, { listOfWeights: ['3', '4'] }])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Waste Weights Check tests:', () => {
  lab.test('buildlines works correctly', async () => {
    const check = new WasteWeightsCheck()
    const lines = await check.buildLines()

    const { heading, headingId, answers, links } = lines.pop()

    Code.expect(heading).to.equal('Waste storage capacity and annual throughput')
    Code.expect(headingId).to.equal(`${prefix}-heading`)

    const { answer, answerId } = answers.pop()

    Code.expect(answer).to.equal('1, 2; 3, 4')
    Code.expect(answerId).to.equal(`${prefix}-answer`)

    const { link, linkId, linkType } = links.pop()
    Code.expect(link).to.equal('/waste-weights')
    Code.expect(linkType).to.equal('waste storage capacity and annual throughput')
    Code.expect(linkId).to.equal(`${prefix}-link`)
  })

  lab.test(`Provides the correct task`, async () => {
    Code.expect(WasteWeightsCheck.task.id).to.equal('waste-weights')
  })
})
