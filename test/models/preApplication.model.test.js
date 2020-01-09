'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')

const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')
const PreApplication = require('../../src/models/preApplication.model')

const context = { }

const DISCUSSED_APPLICATION = {
  questionCode: 'pre-application-discussed',
  answerText: 'received-advice'
}

let mocks
let saveSpy

lab.experiment('PreApplication model test:', () => {
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
    lab.test('Retrieve discussedApplication', async () => {
      const { questionCode, answerText } = DISCUSSED_APPLICATION
      mocks.applicationAnswers[0] = { questionCode, answerText }

      const preApplication = await PreApplication.get(context)

      Code.expect(preApplication.discussedApplication).to.equal(answerText)
    })
  })

  lab.experiment('save', () => {
    lab.test('Save discussedApplication', async () => {
      const preApplication = new PreApplication()
      preApplication.discussedApplication = DISCUSSED_APPLICATION.answerText

      await preApplication.save(context)

      Code.expect(saveSpy.callCount).to.equal(1)
    })
  })
})
