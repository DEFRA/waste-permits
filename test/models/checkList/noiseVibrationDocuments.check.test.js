'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkList/base.check')
const NoiseVibrationDocumentsCheck = require('../../../src/models/checkList/noiseVibrationDocuments.check')

const fakeNoiseVibrationDocuments = [
  { filename: 'FILENAME_1' },
  { filename: 'FILENAME_2' },
  { filename: 'FILENAME_3' }
]

const prefix = 'section-noise-vibration-documents'

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getUploadedFileDetails').value(() => fakeNoiseVibrationDocuments)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('NoiseVibrationDocuments Check tests:', () => {
  lab.experiment('buildlines', () => {
    let check
    let lines

    lab.beforeEach(async () => {
      check = new NoiseVibrationDocumentsCheck()
      lines = await check.buildLines()
    })

    lab.test('(noise vibration emissions documents line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines.pop()
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${prefix}-answer-${answerIndex + 1}`)
        const { filename } = fakeNoiseVibrationDocuments[answerIndex]
        Code.expect(answer).to.equal(filename)
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/noise-vibration-plan/upload')
      Code.expect(linkType).to.equal('noise and vibration emissions documents')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })
  })
})
