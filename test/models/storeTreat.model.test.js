'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')

const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')

const context = { }

const YES = 'yes'
const NO = 'no'

const TestModel = require('../../src/models/storeTreat.model')
const questionCode = 'clinical-waste-store-treat'
const testItem = 'storeTreat'

let mocks
let saveSpy

lab.experiment('Clinical Waste Documents - StoreTreat test:', () => {
  let sandbox

  lab.beforeEach(() => {
    mocks = new Mocks()

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub methods
    sandbox.stub(ApplicationAnswer, 'getByQuestionCode').value(() => mocks.applicationAnswers[0])
    saveSpy = sandbox.stub(ApplicationAnswer.prototype, 'save')
    saveSpy.callsFake(async () => undefined)
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('get', () => {
    lab.test('Set as yes', async () => {
      mocks.applicationAnswers[0].questionCode = questionCode
      mocks.applicationAnswers[0].answerText = YES
      const testObject = await TestModel.get(context)
      Code.expect(testObject[testItem]).to.be.true()
    })

    lab.test('Set as no', async () => {
      mocks.applicationAnswers[0].questionCode = questionCode
      mocks.applicationAnswers[0].answerText = NO
      const testObject = await TestModel.get(context)
      Code.expect(testObject[testItem]).to.be.false()
    })
  })

  lab.experiment('save', () => {
    lab.test('Set as yes', async () => {
      const testObject = new TestModel()
      testObject[testItem] = true
      await testObject.save(context)
      Code.expect(saveSpy.callCount).to.equal(1)
    })

    lab.test('Set as no', async () => {
      const testObject = new TestModel()
      testObject[testItem] = false
      await testObject.save(context)
      Code.expect(saveSpy.callCount).to.equal(1)
    })
  })
})
