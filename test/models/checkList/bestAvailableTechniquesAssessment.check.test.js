'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkList/base.check')
const BestAvailableTechniquesAssessmentCheck = require('../../../src/models/checkList/bestAvailableTechniquesAssessment.check')

const fakeBestAvailableTechniquesAssessments = [
  { filename: 'FILENAME_1' },
  { filename: 'FILENAME_2' },
  { filename: 'FILENAME_3' }
]

const prefix = 'section-best-available-techniques-assessment'

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getBestAvailableTechniquesAssessment').value(() => fakeBestAvailableTechniquesAssessments)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('BestAvailableTechniquesAssessment Check tests:', () => {
  lab.experiment('buildlines', () => {
    let check
    let lines

    lab.beforeEach(async () => {
      check = new BestAvailableTechniquesAssessmentCheck()
      lines = await check.buildLines()
    })

    lab.test(`(best available techniques assessment line) works correctly`, async () => {
      const { heading, headingId, answers, links } = lines.pop()
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${prefix}-answer-${answerIndex + 1}`)
        const { filename } = fakeBestAvailableTechniquesAssessments[answerIndex]
        Code.expect(answer).to.equal(filename)
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/mcp/best-available-techniques-assessment/upload')
      Code.expect(linkType).to.equal('best available techniques assessment')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })
  })
})
