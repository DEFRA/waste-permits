'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkList/base.check')
const EnvironmentalRiskAssessmentCheck = require('../../../src/models/checkList/environmentalRiskAssessment.check')

const fakeEnvironmentalRiskAssessments = [
  { filename: 'FILENAME_1' },
  { filename: 'FILENAME_2' },
  { filename: 'FILENAME_3' }
]

const prefix = 'section-environmental-risk-assessment'

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getUploadedFileDetails').value(() => fakeEnvironmentalRiskAssessments)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Environmental Risk Assessment Check tests:', () => {
  lab.experiment('buildlines', () => {
    let check
    let lines

    lab.beforeEach(async () => {
      sandbox.stub(BaseCheck.prototype, 'getApplication').value(() => ({}))
      check = new EnvironmentalRiskAssessmentCheck()
      lines = await check.buildLines()
    })

    lab.test('(environmental risk assessment line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines.pop()
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${prefix}-answer-${answerIndex + 1}`)
        const { filename } = fakeEnvironmentalRiskAssessments[answerIndex]
        Code.expect(answer).to.equal(filename)
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/environmental-risk-assessment/upload')
      Code.expect(linkType).to.equal('environmental risk assessment')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })
  })
})
