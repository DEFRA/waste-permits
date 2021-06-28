'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkList/base.check')
const EmissionsAndMonitoringCheck = require('../../../src/models/checkList/emissionsAndMonitoring.check')

const prefix = 'section-emissions-and-monitoring'

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Emission and monitoring check tests:', () => {
  lab.experiment('buildlines', () => {
    lab.test('(emissions and monitoring details line) works correctly if no details', async () => {
      const blah = { emissionsAndMonitoringDetailsRequired: false }

      sandbox.stub(BaseCheck.prototype, 'getEmissionsAndMonitoringDetails').value(() => blah)
      const check = new EmissionsAndMonitoringCheck()
      const lines = await check.buildLines()

      const { heading, headingId, answers, links } = lines.pop()
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      Code.expect(answers.length).to.equal(1)
      Code.expect(answers[0].answer).to.equal('Not required')
      Code.expect(answers[0].answerId).to.equal(`${prefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/emissions/check')
      Code.expect(linkType).to.equal('emissions and monitoring')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })

    lab.test('(emissions and monitoring details line) works correctly with details', async () => {
      const fakeEmissionsAndMonitoringDetails = {
        emissionsAndMonitoringDetailsRequired: true,
        files: [
          { filename: 'FILENAME_1' },
          { filename: 'FILENAME_2' },
          { filename: 'FILENAME_3' }
        ]
      }

      sandbox.stub(BaseCheck.prototype, 'getEmissionsAndMonitoringDetails').value(() => fakeEmissionsAndMonitoringDetails)
      const check = new EmissionsAndMonitoringCheck()
      const lines = await check.buildLines()

      const { heading, headingId, answers, links } = lines.pop()
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${prefix}-answer-${answerIndex + 1}`)
        const { filename } = fakeEmissionsAndMonitoringDetails.files[answerIndex]
        Code.expect(answer).to.equal(filename)
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/emissions/check')
      Code.expect(linkType).to.equal('emissions and monitoring')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })
  })
})
