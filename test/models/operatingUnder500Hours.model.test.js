'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')

const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')
const OperatingUnder500Hours = require('../../src/models/operatingUnder500Hours.model')

const context = { authToken: 'AUTH_TOKEN' }

const YES = 'yes'
const NO = 'no'

let mocks
let saveSpy

lab.experiment('OperatingUnder500Hours test:', () => {
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
      mocks.applicationAnswers[0].questionCode = 'operating-under-500-hours'
      mocks.applicationAnswers[0].answerText = YES
      const operatingUnder500Hours = await OperatingUnder500Hours.get(context)
      Code.expect(operatingUnder500Hours.operatingUnder500Hours).to.be.true()
    })

    lab.test('Set as no', async () => {
      mocks.applicationAnswers[0].questionCode = 'operating-under-500-hours'
      mocks.applicationAnswers[0].answerText = NO
      const operatingUnder500Hours = await OperatingUnder500Hours.get(context)
      Code.expect(operatingUnder500Hours.operatingUnder500Hours).to.be.false()
    })
  })

  lab.experiment('save', () => {
    lab.test('Set as yes', async () => {
      const operatingUnder500Hours = new OperatingUnder500Hours()
      operatingUnder500Hours.operatingUnder500Hours = true
      await operatingUnder500Hours.save(context)
      Code.expect(saveSpy.callCount).to.equal(1)
    })

    lab.test('Set as no', async () => {
      const operatingUnder500Hours = new OperatingUnder500Hours()
      operatingUnder500Hours.operatingUnder500Hours = false
      await operatingUnder500Hours.save(context)
      Code.expect(saveSpy.callCount).to.equal(1)
    })
  })
})
