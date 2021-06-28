'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkList/base.check')
const NonTechnicalSummaryCheck = require('../../../src/models/checkList/nonTechnicalSummary.check')

const fakeNonTechnicalSummaries = [
  { filename: 'FILENAME_1' },
  { filename: 'FILENAME_2' },
  { filename: 'FILENAME_3' }
]

const prefix = 'section-non-technical-summary'

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getUploadedFileDetails').value(() => fakeNonTechnicalSummaries)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Non-technical Summary Check tests:', () => {
  lab.experiment('buildlines', () => {
    let check
    let lines

    lab.beforeEach(async () => {
      sandbox.stub(BaseCheck.prototype, 'getApplication').value(() => ({}))
      check = new NonTechnicalSummaryCheck()
      lines = await check.buildLines()
    })

    lab.test('(non-technical summary line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines.pop()
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${prefix}-answer-${answerIndex + 1}`)
        const { filename } = fakeNonTechnicalSummaries[answerIndex]
        Code.expect(answer).to.equal(filename)
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/non-technical-summary')
      Code.expect(linkType).to.equal('non-technical summary')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })

    lab.test('Provides the correct task', async () => {
      Code.expect(NonTechnicalSummaryCheck.task.id).to.equal('non-technical-summary')
    })
  })
})
