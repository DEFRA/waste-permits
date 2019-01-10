'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')

const Application = require('../../src/persistence/entities/application.entity')
const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')
const DataStore = require('../../src/models/dataStore.model')
const CharityDetail = require('../../src/models/charityDetail.model')

let context
let fakeApplicationAnswerName
let fakeApplicationAnswerNumber
let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  context = mocks.context

  fakeApplicationAnswerNumber = new ApplicationAnswer({
    questionCode: 'general-charity-number',
    answerText: 'CHARITY_NUMBER'
  })

  fakeApplicationAnswerName = new ApplicationAnswer({
    questionCode: 'general-charity-name',
    answerText: 'CHARITY_NAME'
  })

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application, 'getById').callsFake(() => mocks.application)
  sandbox.stub(Application.prototype, 'save').value(() => undefined)
  sandbox.stub(ApplicationAnswer, 'listByMultipleQuestionCodes').callsFake(() => [fakeApplicationAnswerName, fakeApplicationAnswerNumber])
  sandbox.stub(ApplicationAnswer.prototype, 'save').value(async () => undefined)
  sandbox.stub(ApplicationAnswer.prototype, 'clear').value(async () => undefined)
  sandbox.stub(DataStore, 'get').callsFake(() => mocks.dataStore)
  sandbox.stub(DataStore.prototype, 'save').value(() => undefined)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('CharityDetail Model tests:', () => {
  lab.test('get() method correctly retrieves the charity details when the name is retrieved from the application answers', async () => {
    mocks.application.tradingName = ''
    const charityDetail = await CharityDetail.get(context)
    const { charityName, charityNumber } = charityDetail
    Code.expect(charityName).to.equal(fakeApplicationAnswerName.answerText)
    Code.expect(charityNumber).to.equal(fakeApplicationAnswerNumber.answerText)
  })

  lab.test('get() method correctly retrieves the charity details when the name is retrieved from the trading name', async () => {
    fakeApplicationAnswerName = new ApplicationAnswer({
      questionCode: 'unknown-key'
    })
    const charityDetail = await CharityDetail.get(context)
    const { charityName, charityNumber } = charityDetail
    Code.expect(charityName).to.equal(mocks.application.tradingName)
    Code.expect(charityNumber).to.equal(fakeApplicationAnswerNumber.answerText)
  })

  lab.experiment('CharityDetail Model tests:', () => {
    lab.experiment('save() method', () => {
      let applicationSpy
      let applicationAnswerSpy
      let dataStoreSaveSpy

      lab.beforeEach(() => {
        applicationSpy = sinon.spy(Application.prototype, 'save')
        applicationAnswerSpy = sinon.spy(ApplicationAnswer.prototype, 'save')
        dataStoreSaveSpy = sinon.spy(DataStore.prototype, 'save')
      })

      lab.afterEach(() => {
        Code.expect(applicationSpy.callCount).to.equal(1)
        Code.expect(applicationAnswerSpy.callCount).to.equal(2)
        Code.expect(dataStoreSaveSpy.callCount).to.equal(1)
        applicationSpy.restore()
        applicationAnswerSpy.restore()
        dataStoreSaveSpy.restore()
      })

      lab.test('correctly saves the charity details when the charity is for an individual', async () => {
        mocks.charityDetail.charityPermitHolder = 'individual'
        await mocks.charityDetail.save(context)
        Code.expect(mocks.application.tradingName).to.equal(undefined)
      })

      lab.test('correctly saves the charity details when the charity is for a public body', async () => {
        mocks.charityDetail.charityPermitHolder = 'public-body'
        await mocks.charityDetail.save(context)
        Code.expect(mocks.application.tradingName).to.equal(fakeApplicationAnswerName.answerText)
      })
    })

    lab.test('delete() method correctly saves the charity details when the charity is for a public body', async () => {
      let applicationAnswerSpy = sinon.spy(ApplicationAnswer.prototype, 'clear')
      await mocks.charityDetail.delete(context)
      Code.expect(applicationAnswerSpy.callCount).to.equal(2)
      applicationAnswerSpy.restore()
    })
  })
})
