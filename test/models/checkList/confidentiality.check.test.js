'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const BaseCheck = require('../../../src/models/checkList/base.check')
const ConfidentialityCheck = require('../../../src/models/checkList/confidentiality.check')

const prefix = 'section-confidentiality'
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

lab.experiment('Confidentiality Check tests:', () => {
  lab.test('buildlines works correctly', async () => {
    const check = new ConfidentialityCheck()
    const lines = await check.buildLines()
    const { heading, headingId, answers, links } = lines.pop()

    Code.expect(heading).to.equal(heading)
    Code.expect(headingId).to.equal(`${prefix}-heading`)

    const { confidentialityDetails } = mocks.application
    answers.forEach(({ answer, answerId }, answerIndex) => {
      Code.expect(answerId).to.equal(`${prefix}-answer-${answerIndex + 1}`)
      switch (answerIndex) {
        case 0:
          Code.expect(answer).to.equal('You are claiming confidentiality for these reasons:')
          break
        case 1:
          Code.expect(answer).to.equal(confidentialityDetails.split('\n')[0])
          break
        case 2:
          Code.expect(answer).to.equal(confidentialityDetails.split('\n')[1])
          break
      }
    })

    const { link, linkId, linkType } = links.pop()
    Code.expect(link).to.equal('/confidentiality')
    Code.expect(linkType).to.equal('commercial confidentiality')
    Code.expect(linkId).to.equal(`${prefix}-link`)
  })
})
