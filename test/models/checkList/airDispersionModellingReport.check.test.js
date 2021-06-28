'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkList/base.check')
const AirDispersionModellingReportCheck = require('../../../src/models/checkList/airDispersionModellingReport.check')

const fakeAirDispersionModellingReports = [
  { filename: 'FILENAME_1' },
  { filename: 'FILENAME_2' },
  { filename: 'FILENAME_3' }
]

const prefix = 'section-air-dispersion-modelling-report'

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getUploadedFileDetails').value(() => fakeAirDispersionModellingReports)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Air dispersion modelling Report Check tests:', () => {
  lab.experiment('buildlines', () => {
    let check
    let lines

    lab.beforeEach(async () => {
      check = new AirDispersionModellingReportCheck()
      lines = await check.buildLines()
    })

    lab.test('(air dispersion modelling line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines.pop()
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${prefix}-answer-${answerIndex + 1}`)
        const { filename } = fakeAirDispersionModellingReports[answerIndex]
        Code.expect(answer).to.equal(filename)
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/mcp/air-dispersion-modelling/upload/modelling')
      Code.expect(linkType).to.equal('air dispersion modelling report')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })
  })
})
