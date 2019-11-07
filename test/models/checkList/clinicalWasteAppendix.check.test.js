'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkList/base.check')
const ClinicalWasteAppendixCheck = require('../../../src/models/checkList/clinicalWasteAppendix.check')

const fakeFiles = [
  { filename: 'FILENAME_1' },
  { filename: 'FILENAME_2' },
  { filename: 'FILENAME_3' }
]

const prefix = 'section-clinical-waste-appendix'

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getUploadedFileDetails').value(() => fakeFiles)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Clinical Waste Appendix Check tests:', () => {
  lab.experiment('buildlines', () => {
    let check
    let lines

    lab.beforeEach(async () => {
      sandbox.stub(BaseCheck.prototype, 'getApplication').value(() => ({}))
      check = new ClinicalWasteAppendixCheck()
      lines = await check.buildLines()
    })

    lab.test('(Justification for storing or treating a waste type not included in Section 2.1) works correctly', async () => {
      const { heading, headingId, answers, links } = lines[0]
      Code.expect(heading).to.equal('Justification for storing or treating a waste type not included in Section 2.1')
      Code.expect(headingId).to.equal(`${prefix}-justification-heading`)

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${prefix}-justification-answer-${answerIndex + 1}`)
        const { filename } = fakeFiles[answerIndex]
        Code.expect(answer).to.equal(filename)
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/clinical-waste-documents/justification/upload')
      Code.expect(linkType).to.equal('justification for storing or treating a waste type not included in Section 2.1')
      Code.expect(linkId).to.equal(`${prefix}-justification-link`)
    })

    lab.test('(Clinical waste treatment summary) works correctly', async () => {
      const { heading, headingId, answers, links } = lines[1]
      Code.expect(heading).to.equal('Clinical waste treatment summary')
      Code.expect(headingId).to.equal(`${prefix}-summary-heading`)

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${prefix}-summary-answer-${answerIndex + 1}`)
        const { filename } = fakeFiles[answerIndex]
        Code.expect(answer).to.equal(filename)
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/clinical-waste-documents/summary/upload')
      Code.expect(linkType).to.equal('clinical waste treatment summary')
      Code.expect(linkId).to.equal(`${prefix}-summary-link`)
    })

    lab.test('(Clinical waste layout plans and process flows) works correctly', async () => {
      const { heading, headingId, answers, links } = lines[2]
      Code.expect(heading).to.equal('Clinical waste layout plans and process flows')
      Code.expect(headingId).to.equal(`${prefix}-layout-heading`)

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${prefix}-layout-answer-${answerIndex + 1}`)
        const { filename } = fakeFiles[answerIndex]
        Code.expect(answer).to.equal(filename)
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/clinical-waste-documents/layout-plans/upload')
      Code.expect(linkType).to.equal('clinical waste layout plans and process flows')
      Code.expect(linkId).to.equal(`${prefix}-layout-link`)
    })

    lab.test('Provides the correct task', async () => {
      Code.expect(ClinicalWasteAppendixCheck.task.id).to.equal('clinical-waste-appendix')
    })
  })
})
