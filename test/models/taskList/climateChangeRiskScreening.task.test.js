'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const Annotation = require('../../../src/persistence/entities/annotation.entity')
const ApplicationAnswer = require('../../../src/persistence/entities/applicationAnswer.entity')
const ClimateChangeRiskScreeningModel = require('../../../src/models/climateChangeRiskScreening.model')
const ClimateChangeRiskScreening = require('../../../src/models/taskList/climateChangeRiskScreening.task')

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(Annotation, 'listByApplicationIdAndSubject').value(() => [{}])
  sandbox.stub(ApplicationAnswer, 'listByMultipleQuestionCodes').callsFake(async () => mocks.applicationAnswers)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: ClimateChangeRiskScreening Model tests:', () => {
  lab.test('checkComplete() method correctly returns FALSE when nothing entered yet', async () => {
    sandbox.stub(ClimateChangeRiskScreeningModel, 'isUploadRequired').resolves(undefined)

    const result = await ClimateChangeRiskScreening.checkComplete(mocks.context)

    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns TRUE when upload not required', async () => {
    sandbox.stub(ClimateChangeRiskScreeningModel, 'isUploadRequired').resolves(false)

    const result = await ClimateChangeRiskScreening.checkComplete(mocks.context)

    Code.expect(result).to.equal(true)
  })

  lab.test('checkComplete() method correctly returns FALSE when upload is required and annotations don\'t exist', async () => {
    sandbox.stub(ClimateChangeRiskScreeningModel, 'isUploadRequired').resolves(true)
    Annotation.listByApplicationIdAndSubject = () => []

    const result = await ClimateChangeRiskScreening.checkComplete(mocks.context)

    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns TRUE when upload is required and annotations exist', async () => {
    sandbox.stub(ClimateChangeRiskScreeningModel, 'isUploadRequired').resolves(true)

    const result = await ClimateChangeRiskScreening.checkComplete(mocks.context)

    Code.expect(result).to.equal(true)
  })
})
