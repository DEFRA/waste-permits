'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')

const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')
const Application = require('../../src/persistence/entities/application.entity')
const PreApplication = require('../../src/models/preApplication.model')

const APPLICATION_ADVICE = {
  questionCode: 'pre-application-advice',
  answerText: 'received-advice'
}

const PRE_APPLICATION_REFERENCE = 'EPR/AB1234CD/A001'

let mocks
let applicationSaveSpy
let applicationAnswerSaveSpy
let context

lab.experiment('PreApplication model test:', () => {
  let sandbox

  lab.beforeEach(() => {
    mocks = new Mocks()

    context = mocks.context

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub methods
    sandbox.stub(Application, 'getById').callsFake(() => mocks.application)
    sandbox.stub(Application.prototype, 'save').value(() => undefined)
    applicationSaveSpy = sandbox.stub(Application.prototype, 'save')
    applicationSaveSpy.callsFake(async () => undefined)
    sandbox.stub(ApplicationAnswer, 'listByMultipleQuestionCodes').callsFake(async () => mocks.applicationAnswers)
    applicationAnswerSaveSpy = sandbox.stub(ApplicationAnswer.prototype, 'save')
    applicationAnswerSaveSpy.callsFake(async () => undefined)
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('get', () => {
    lab.test('Retrieve preApplicationAdvice', async () => {
      const { questionCode, answerText } = APPLICATION_ADVICE
      mocks.applicationAnswers[0] = { questionCode, answerText }

      const preApplication = await PreApplication.get(context)

      Code.expect(preApplication.receivedPreApplicationAdvice).to.equal(answerText)
    })

    lab.test('Retrieve preApplicationReference', async () => {
      mocks.application.preApplicationReference = PRE_APPLICATION_REFERENCE

      const preApplication = await PreApplication.get(context)

      Code.expect(preApplication.preApplicationReference).to.equal(PRE_APPLICATION_REFERENCE)
    })
  })

  lab.experiment('save', () => {
    lab.test('Save preApplicationAdvice', async () => {
      const preApplication = new PreApplication()
      preApplication.receivedPreApplicationAdvice = APPLICATION_ADVICE.answerText

      await preApplication.save(context)

      Code.expect(applicationAnswerSaveSpy.callCount).to.equal(1)
    })

    lab.test('Save preApplicationReference', async () => {
      const preApplication = new PreApplication()
      preApplication.preApplicationReference = PRE_APPLICATION_REFERENCE

      await preApplication.save(context)

      Code.expect(applicationSaveSpy.callCount).to.equal(1)
    })
  })
})
