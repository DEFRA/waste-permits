'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')

const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')
const ClimateChangeRiskScreening = require('../../src/models/climateChangeRiskScreening.model')

const context = { }

const PERMIT_LENGTH = {
  questionCode: 'climate-change-permit-length',
  answerText: 'less-than-5'
}

const FLOOD_RISK = {
  questionCode: 'climate-change-flood-risk',
  answerText: 'not-in-flood-risk-zone'
}

const WATER_SOURCE = {
  questionCode: 'climate-change-water-source',
  answerText: 'water-not-required'
}

let mocks
let saveSpy

lab.experiment('ClimateChangeRiskScreening test:', () => {
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
    lab.test('Retrieve permit length', async () => {
      const { questionCode, answerText } = PERMIT_LENGTH
      mocks.applicationAnswers[0] = { questionCode, answerText }

      const climateChangeRiskScreening = await ClimateChangeRiskScreening.get(context)

      Code.expect(climateChangeRiskScreening.permitLength).to.equal(answerText)
    })

    lab.test('Retrieve flood risk', async () => {
      const { questionCode, answerText } = FLOOD_RISK
      mocks.applicationAnswers[0] = { questionCode, answerText }

      const climateChangeRiskScreening = await ClimateChangeRiskScreening.get(context)

      Code.expect(climateChangeRiskScreening.floodRisk).to.equal(answerText)
    })

    lab.test('Retrieve water source', async () => {
      const { questionCode, answerText } = WATER_SOURCE
      mocks.applicationAnswers[0] = { questionCode, answerText }

      const climateChangeRiskScreening = await ClimateChangeRiskScreening.get(context)

      Code.expect(climateChangeRiskScreening.waterSource).to.equal(answerText)
    })
  })

  lab.experiment('save', () => {
    lab.test('Save permitLength', async () => {
      const climateChangeRiskScreening = new ClimateChangeRiskScreening()
      climateChangeRiskScreening.permitLength = PERMIT_LENGTH.answerText

      await climateChangeRiskScreening.save(context)

      Code.expect(saveSpy.callCount).to.equal(1)
    })

    lab.test('Save floodRisk', async () => {
      const climateChangeRiskScreening = new ClimateChangeRiskScreening()
      climateChangeRiskScreening.permitLength = FLOOD_RISK.answerText

      await climateChangeRiskScreening.save(context)

      Code.expect(saveSpy.callCount).to.equal(1)
    })

    lab.test('Save waterSource', async () => {
      const climateChangeRiskScreening = new ClimateChangeRiskScreening()
      climateChangeRiskScreening.permitLength = WATER_SOURCE.answerText

      await climateChangeRiskScreening.save(context)

      Code.expect(saveSpy.callCount).to.equal(1)
    })
  })

  lab.experiment('isUploadRequired', () => {
    lab.test('Return false if permit length is less than 5 years', async () => {
      const climateChangeRiskScreening = new ClimateChangeRiskScreening()
      climateChangeRiskScreening.permitLength = 'less-than-5'

      const result = await ClimateChangeRiskScreening.isUploadRequired(climateChangeRiskScreening)

      Code.expect(result).to.equal(false)
    })

    lab.test('Return false if score is less than 5', async () => {
      const climateChangeRiskScreening = new ClimateChangeRiskScreening()
      climateChangeRiskScreening.permitLength = 'between-2020-and-2040'
      climateChangeRiskScreening.floodRisk = 'very-low-or-low'
      climateChangeRiskScreening.waterSource = 'mains-water'

      const result = await ClimateChangeRiskScreening.isUploadRequired(climateChangeRiskScreening)

      Code.expect(result).to.equal(false)
    })

    lab.test('Return true if score is 5 or more', async () => {
      const climateChangeRiskScreening = new ClimateChangeRiskScreening()
      climateChangeRiskScreening.permitLength = 'between-2040-and-2060'
      climateChangeRiskScreening.floodRisk = 'very-low-or-low'
      climateChangeRiskScreening.waterSource = 'mains-water'

      const result = await ClimateChangeRiskScreening.isUploadRequired(climateChangeRiskScreening)

      Code.expect(result).to.equal(true)
    })
  })
})
