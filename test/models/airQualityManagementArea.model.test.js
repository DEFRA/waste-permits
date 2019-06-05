'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')

const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')
const AirQualityManagementArea = require('../../src/models/airQualityManagementArea.model')

const context = { authToken: 'AUTH_TOKEN' }

const YES = 'yes'
const NO = 'no'
const TEST_AQMA_NAME = 'Test AQMA'
const TEST_NO2_LEVEL = 42
const TEST_AUTH_NAME = 'Test authority'

let mocks
let saveSpy

lab.experiment('AirQualityManagementArea test:', () => {
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
      mocks.applicationAnswers[0].answerText = NO

      const airQualityManagementArea = await AirQualityManagementArea.get(context)

      Code.expect(airQualityManagementArea.isInAqma).to.be.false()
      Code.expect(airQualityManagementArea.name).to.not.exist()
      Code.expect(airQualityManagementArea.nitrogenDioxideLevel).to.not.exist()
      Code.expect(airQualityManagementArea.localAuthorityName).to.not.exist()
    })

    lab.test('AQMA is set as yes', async () => {
      mocks.applicationAnswers[0].questionCode = 'aqma-is-in-aqma'
      mocks.applicationAnswers[0].answerText = YES
      mocks.applicationAnswers[1].questionCode = 'aqma-name'
      mocks.applicationAnswers[1].answerText = TEST_AQMA_NAME
      mocks.applicationAnswers[2].questionCode = 'aqma-nitrogen-dioxide-level'
      mocks.applicationAnswers[2].answerText = TEST_NO2_LEVEL
      mocks.applicationAnswers[3].questionCode = 'aqma-local-authority-name'
      mocks.applicationAnswers[3].answerText = TEST_AUTH_NAME

      const airQualityManagementArea = await AirQualityManagementArea.get(context)

      Code.expect(airQualityManagementArea.isInAqma).to.be.true()
      Code.expect(airQualityManagementArea.name).to.equal(TEST_AQMA_NAME)
      Code.expect(airQualityManagementArea.nitrogenDioxideLevel).to.equal(TEST_NO2_LEVEL)
      Code.expect(airQualityManagementArea.localAuthorityName).to.equal(TEST_AUTH_NAME)
    })
  })

  lab.experiment('save', () => {
    lab.test('with AQMA set to No', async () => {
      const airQualityManagementArea = new AirQualityManagementArea()
      airQualityManagementArea.isInAqma = false
      await airQualityManagementArea.save(context)
      Code.expect(saveSpy.callCount).to.equal(4)
    })

    lab.test('with AQMA set to Yes', async () => {
      const airQualityManagementArea = new AirQualityManagementArea()
      airQualityManagementArea.isInAqma = true
      airQualityManagementArea.name = TEST_AQMA_NAME
      airQualityManagementArea.nitrogenDioxideLevelAnswer = TEST_NO2_LEVEL
      airQualityManagementArea.localAuthorityNameAnswer = TEST_AUTH_NAME
      await airQualityManagementArea.save(context)
      Code.expect(saveSpy.callCount).to.equal(4)
    })
  })
})
