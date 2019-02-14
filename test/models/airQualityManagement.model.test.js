'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')

const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')
const AirQualityManagement = require('../../src/models/airQualityManagement.model')

const context = { authToken: 'AUTH_TOKEN' }

const TEST_AQMA_NAME = 'Test AQMA'
const TEST_NO2_LEVEL = 42
const TEST_AUTH_NAME = 'Test authority'

let mocks
let saveSpy

lab.experiment('AirQualityManagement test:', () => {
  let sandbox

  lab.beforeEach(() => {
    mocks = new Mocks()

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub methods
    sandbox.stub(ApplicationAnswer, 'listByMultipleQuestionCodes').callsFake(async () => mocks.applicationAnswers)
    saveSpy = sandbox.stub(ApplicationAnswer.prototype, 'save')
    saveSpy.callsFake(async () => undefined)
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('get', () => {
    lab.test('AQMA is set as no', async () => {
      mocks.applicationAnswers[0].questionCode = 'aqma-is-in-aqma'
      mocks.applicationAnswers[0].answerCode = false
      const airQualityManagement = await AirQualityManagement.get(context)
      Code.expect(airQualityManagement.aqmaIsInAqma).to.be.false()
      Code.expect(airQualityManagement.aqmaName).to.not.exist()
      Code.expect(airQualityManagement.aqmaNitrogenDioxideLevel).to.not.exist()
      Code.expect(airQualityManagement.aqmaLocalAuthorityName).to.not.exist()
    })

    lab.test('AQMA is set as yes', async () => {
      mocks.applicationAnswers[0].questionCode = 'aqma-is-in-aqma'
      mocks.applicationAnswers[0].answerCode = true
      mocks.applicationAnswers[1].questionCode = 'aqma-name'
      mocks.applicationAnswers[1].answerText = TEST_AQMA_NAME
      mocks.applicationAnswers[2].questionCode = 'aqma-nitrogen-dioxide-level'
      mocks.applicationAnswers[2].answerText = TEST_NO2_LEVEL
      mocks.applicationAnswers[3].questionCode = 'aqma-local-authority-name'
      mocks.applicationAnswers[3].answerText = TEST_AUTH_NAME

      const airQualityManagement = await AirQualityManagement.get(context)

      Code.expect(airQualityManagement.aqmaIsInAqma).to.be.true()
      Code.expect(airQualityManagement.aqmaName).to.equal(TEST_AQMA_NAME)
      Code.expect(airQualityManagement.aqmaNitrogenDioxideLevel).to.equal(TEST_NO2_LEVEL)
      Code.expect(airQualityManagement.aqmaLocalAuthorityName).to.equal(TEST_AUTH_NAME)
    })
  })

  lab.experiment('save', () => {
    lab.test('with AQMA set to No', async () => {
      const airQualityManagement = new AirQualityManagement()
      airQualityManagement.aqmaIsInAqma = false
      await airQualityManagement.save(context)
      Code.expect(saveSpy.callCount).to.equal(1)
    })

    lab.test('with AQMA set to Yes', async () => {
      const airQualityManagement = new AirQualityManagement()
      airQualityManagement.aqmaIsInAqma = true
      airQualityManagement.aqmaName = TEST_AQMA_NAME
      airQualityManagement.nitrogenDioxideLevelAnswer = TEST_NO2_LEVEL
      airQualityManagement.localAuthorityNameAnswer = TEST_AUTH_NAME
      await airQualityManagement.save(context)
      Code.expect(saveSpy.callCount).to.equal(1)
    })
  })
})
