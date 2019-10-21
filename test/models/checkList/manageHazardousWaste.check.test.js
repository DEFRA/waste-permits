'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkList/base.check')
const ManageHazardousWasteCheck = require('../../../src/models/checkList/manageHazardousWaste.check')

const fakeFiles = [
  { filename: 'FILENAME_1' },
  { filename: 'FILENAME_2' },
  { filename: 'FILENAME_3' }
]

const prefix = 'section-manage-hazardous-waste'

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

lab.experiment('Manage Hazardous Waste Check tests:', () => {
  lab.experiment('buildlines', () => {
    let check
    let lines

    lab.beforeEach(async () => {
      sandbox.stub(BaseCheck.prototype, 'getApplication').value(() => ({}))
      check = new ManageHazardousWasteCheck()
      lines = await check.buildLines()
    })

    lab.test(`(Summary of how you’ll treat hazardous waste line) works correctly`, async () => {
      const { heading, headingId, answers, links } = lines[0]
      Code.expect(heading).to.equal('Summary of how you’ll treat hazardous waste')
      Code.expect(headingId).to.equal(`${prefix}-treatment-heading`)

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${prefix}-treatment-answer-${answerIndex + 1}`)
        const { filename } = fakeFiles[answerIndex]
        Code.expect(answer).to.equal(filename)
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/hazardous-waste/treatment/upload')
      Code.expect(linkType).to.equal('summary of how you’ll treat hazardous waste')
      Code.expect(linkId).to.equal(`${prefix}-treatment-link`)
    })

    lab.test(`(Hazardous waste layout plans and process flows line) works correctly`, async () => {
      const { heading, headingId, answers, links } = lines[1]
      Code.expect(heading).to.equal('Hazardous waste layout plans and process flows')
      Code.expect(headingId).to.equal(`${prefix}-plans-heading`)

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${prefix}-plans-answer-${answerIndex + 1}`)
        const { filename } = fakeFiles[answerIndex]
        Code.expect(answer).to.equal(filename)
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/hazardous-waste/plans/upload')
      Code.expect(linkType).to.equal('hazardous waste layout plans and process flows')
      Code.expect(linkId).to.equal(`${prefix}-plans-link`)
    })

    lab.test(`Provides the correct task`, async () => {
      Code.expect(ManageHazardousWasteCheck.task.id).to.equal('hazardous-waste')
    })
  })
})
