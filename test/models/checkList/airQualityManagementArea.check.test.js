'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const BaseCheck = require('../../../src/models/checkList/base.check')
const AirQualityManagementArea = require('../../../src/models/checkList/airQualityManagementArea.check')

const prefix = 'section-aqma'

const TEST_AQMA_NAME = 'Test AQMA'
const TEST_NO2_LEVEL = 42
const TEST_AUTH_NAME = 'Test authority'

let sandbox
let mocks
let check
let lines

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()
  sandbox.stub(BaseCheck.prototype, 'getAirQualityManagementArea').value(async () => mocks.airQualityManagementArea)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('AQMA tests:', () => {
  lab.experiment('buildlines', () => {
    lab.test('Returns correct response when not in AQMA', async () => {
      mocks.airQualityManagementArea.isInAqma = false

      check = new AirQualityManagementArea()
      lines = await check.buildLines()
      const { heading, headingId, answers, links } = lines[0]

      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      Code.expect(answers.length).to.equal(1)
      const { answer, answerId } = answers.pop()
      Code.expect(answer).to.equal('You are not in an AQMA')
      Code.expect(answerId).to.equal(`${prefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/mcp/aqma/name')
      Code.expect(linkType).to.equal('AQMA')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })

    lab.test('Returns correct response when in AQMA', async () => {
      mocks.airQualityManagementArea.isInAqma = true
      mocks.airQualityManagementArea.aqmaName = TEST_AQMA_NAME
      mocks.airQualityManagementArea.aqmaNitrogenDioxideLevel = TEST_NO2_LEVEL
      mocks.airQualityManagementArea.aqmaLocalAuthorityName = TEST_AUTH_NAME
      check = new AirQualityManagementArea()
      lines = await check.buildLines()

      lines.forEach(({ heading, headingId, answers, links }, answerIndex) => {
        Code.expect(headingId).to.equal(`${prefix}-heading`)

        const { link, linkId, linkType } = links.pop()
        Code.expect(link).to.equal('/mcp/aqma/name')
        Code.expect(linkId).to.equal(`${prefix}-link`)

        const { answerId, answer } = answers.pop()
        Code.expect(answerId).to.equal(`${prefix}-answer`)
        switch (answerIndex) {
          case 0:
            Code.expect(heading).to.equal('Is in AQMA')
            Code.expect(answer).to.equal('You are in an AQMA')
            Code.expect(linkType).to.equal('AQMA')
            break
          case 1:
            Code.expect(heading).to.equal('Name of AQMA')
            Code.expect(answer).to.equal(TEST_AQMA_NAME)
            Code.expect(linkType).to.equal('AQMA name')
            break
          case 2:
            Code.expect(heading).to.equal('Background level of nitrogen dioxide')
            Code.expect(answer).to.equal(TEST_NO2_LEVEL)
            Code.expect(linkType).to.equal('AQMA nitrogen dioxide level')
            break
          case 3:
            Code.expect(heading).to.equal('Name of AQMA local authority')
            Code.expect(answer).to.equal(TEST_AUTH_NAME)
            Code.expect(linkType).to.equal('AQMA local authority name')
            break
        }
      })
    })
  })
})
