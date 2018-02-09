'use strict'

const Merge = require('deepmerge')
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkYourAnswers/base.check')
const ConfidentialityCheck = require('../../../src/models/checkYourAnswers/confidentiality.check')

const fakeApplication = {
  confidentiality: true,
  confidentialityDetails: 'CONFIDENTIALITY DETAILS 1\nCONFIDENTIALITY DETAILS 2'
}

const prefix = 'section-confidentiality'
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

lab.experiment('Confidentiality Check tests:', () => {
  lab.test('buildlines works correctly', async () => {
    const check = new ConfidentialityCheck()
    const lines = await check.buildLines()
    const {heading, headingId, answers, links} = lines.pop()

    Code.expect(heading).to.equal(heading)
    Code.expect(headingId).to.equal(`${prefix}-heading`)

    const {confidentialityDetails} = fakeApplication
    answers.forEach(({answer, answerId}, answerIndex) => {
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

    const {link, linkId, linkType} = links.pop()
    Code.expect(link).to.equal('/confidentiality')
    Code.expect(linkType).to.equal('commercial confidentiality')
    Code.expect(linkId).to.equal(`${prefix}-link`)
  })
})
