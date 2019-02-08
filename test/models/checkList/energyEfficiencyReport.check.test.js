'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkList/base.check')
const EnergyEfficiencyReportCheck = require('../../../src/models/checkList/energyEfficiencyReport.check')

const fakeEnergyEfficiencyReports = [
  { filename: 'FILENAME_1' },
  { filename: 'FILENAME_2' },
  { filename: 'FILENAME_3' }
]

const prefix = 'section-energy-efficiency-report'

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getEnergyEfficiencyReport').value(() => fakeEnergyEfficiencyReports)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('EnergyEfficiencyReport Check tests:', () => {
  lab.experiment('buildlines', () => {
    let check
    let lines

    lab.beforeEach(async () => {
      check = new EnergyEfficiencyReportCheck()
      lines = await check.buildLines()
    })

    lab.test(`(energy efficiency report line) works correctly`, async () => {
      const { heading, headingId, answers, links } = lines.pop()
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${prefix}-answer-${answerIndex + 1}`)
        const { filename } = fakeEnergyEfficiencyReports[answerIndex]
        Code.expect(answer).to.equal(filename)
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/mcp/energy-efficiency/upload')
      Code.expect(linkType).to.equal('energy efficiency report')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })
  })
})
