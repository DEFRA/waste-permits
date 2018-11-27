'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')

const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')
const NeedToConsult = require('../../src/models/needToConsult.model')

const context = { authToken: 'AUTH_TOKEN' }

let mocks
let saveSpy

lab.experiment('NeedToConsult test:', () => {
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
    lab.test('when not set', async () => {
      const needToConsult = await NeedToConsult.get(context)
      Code.expect(needToConsult.none).to.not.exist()
    })

    lab.test('when set to none', async () => {
      mocks.applicationAnswers[0].questionCode = 'waste-operation-release-to-sewer'
      mocks.applicationAnswers[0].answerCode = 'no'
      mocks.applicationAnswers[1].questionCode = 'waste-operation-release-to-harbour'
      mocks.applicationAnswers[1].answerCode = 'no'
      mocks.applicationAnswers[2].questionCode = 'waste-operation-release-to-sea-fisheries'
      mocks.applicationAnswers[2].answerCode = 'no'
      const needToConsult = await NeedToConsult.get(context)
      Code.expect(needToConsult.sewer).to.be.false()
      Code.expect(needToConsult.harbour).to.be.false()
      Code.expect(needToConsult.fisheries).to.be.false()
      Code.expect(needToConsult.none).to.be.true()
    })

    lab.test('when one set', async () => {
      mocks.applicationAnswers[0].questionCode = 'waste-operation-release-to-sewer'
      mocks.applicationAnswers[0].answerCode = 'yes'
      const needToConsult = await NeedToConsult.get(context)
      Code.expect(needToConsult.sewer).to.be.true()
      Code.expect(needToConsult.none).to.be.false()
    })
  })

  lab.experiment('save', () => {
    lab.test('with nothing', async () => {
      const needToConsult = new NeedToConsult()
      await needToConsult.save(context)
      Code.expect(saveSpy.callCount).to.equal(3)
    })

    lab.test('with only None selected', async () => {
      const needToConsult = new NeedToConsult()
      needToConsult.none = true
      await needToConsult.save(context)
      Code.expect(saveSpy.callCount).to.equal(3)
    })

    lab.test('with some selected', async () => {
      const needToConsult = new NeedToConsult()
      needToConsult.none = false
      needToConsult.sewer = true
      await needToConsult.save(context)
      Code.expect(saveSpy.callCount).to.equal(3)
    })

    lab.test('with all selected', async () => {
      const needToConsult = new NeedToConsult()
      needToConsult.none = false
      needToConsult.sewer = true
      needToConsult.harbour = true
      needToConsult.fisheries = true
      await needToConsult.save(context)
      Code.expect(saveSpy.callCount).to.equal(3)
    })
  })
})
