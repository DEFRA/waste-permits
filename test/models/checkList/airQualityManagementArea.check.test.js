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

// TODO: lines subject to change so may need to revisit this

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
      Code.expect(linkType).to.equal('Air Quality Management Area')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })

    lab.test('Returns correct response when in AQMA', async () => {
      mocks.airQualityManagementArea.isInAqma = true
      mocks.airQualityManagementArea.aqmaName = TEST_AQMA_NAME
      mocks.airQualityManagementArea.aqmaNitrogenDioxideLevel = TEST_NO2_LEVEL
      mocks.airQualityManagementArea.aqmaLocalAuthorityName = TEST_AUTH_NAME
      check = new AirQualityManagementArea()
      lines = await check.buildLines()
      const { heading, headingId, answers, links } = lines[0]

      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)
      Code.expect(answers.length).to.equal(4)

      answers.forEach(({ answerId, answer }, answerIndex) => {
        Code.expect(answerId).to.equal(`${prefix}-answer-${answerIndex + 1}`)
        switch (answerIndex) {
          case 0:
            Code.expect(answer).to.equal('You are in an AQMA, or may deploy to an AQMA')
            break
          case 1:
            Code.expect(answer).to.equal(`AQMA name: ${TEST_AQMA_NAME}`)
            break
          case 2:
            Code.expect(answer).to.equal(`Background level of nitrogen dioxide: ${TEST_NO2_LEVEL} µg/m3`)
            break
          case 3:
            Code.expect(answer).to.equal(`Local authority: ${TEST_AUTH_NAME}`)
            break
        }
      })
    })
  })
})
