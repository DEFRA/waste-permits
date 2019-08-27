'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkList/base.check')
const SiteConditionReportCheck = require('../../../src/models/checkList/siteConditionReport.check')

const fakeSiteConditionReports = [
  { filename: 'FILENAME_1' },
  { filename: 'FILENAME_2' },
  { filename: 'FILENAME_3' }
]

const prefix = 'section-site-condition-report'

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getSiteConditionReport').value(() => fakeSiteConditionReports)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Site Condition Report Check tests:', () => {
  lab.experiment('buildlines', () => {
    let check
    let lines

    lab.beforeEach(async () => {
      check = new SiteConditionReportCheck()
      lines = await check.buildLines()
    })

    lab.test(`(site condition report line) works correctly`, async () => {
      const { heading, headingId, answers, links } = lines.pop()
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${prefix}-answer-${answerIndex + 1}`)
        const { filename } = fakeSiteConditionReports[answerIndex]
        Code.expect(answer).to.equal(filename)
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/site-condition-report/upload')
      Code.expect(linkType).to.equal('site condition report')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })
  })
})
