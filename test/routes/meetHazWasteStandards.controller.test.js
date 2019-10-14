'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseController = require('../../src/controllers/base.controller')
const Controller = require('../../src/controllers/meetHazWasteStandards.controller')
const RecoveryService = require('../../src/services/recovery.service')
// TODO: Replace with this stub code when the controller is changed to use application answers
//  const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')
const DataStore = require('../../src/models/dataStore.model')

lab.experiment('Meet hazardous waste standards controller tests:', () => {
  let sandbox
  let controller
  // let applicationAnswerStub
  let dataStoreStub

  lab.beforeEach(() => {
    controller = new Controller({ route: {} })

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()
    sandbox.stub(RecoveryService, 'createApplicationContext').resolves({})
    sandbox.stub(BaseController.prototype, 'createPageContext').returns({})
    // applicationAnswerStub = sandbox.stub(ApplicationAnswer, 'getByQuestionCode')
    // applicationAnswerStub.resolves(new ApplicationAnswer({}))
    dataStoreStub = sandbox.stub(DataStore, 'get')
    dataStoreStub.resolves(new DataStore({ data: {} }))
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('GET:', () => {
    let showViewSpy
    lab.beforeEach(() => {
      showViewSpy = sandbox.stub(Controller.prototype, 'showView')
    })

    lab.test('GET returns a view', async () => {
      showViewSpy.returns(true)
      const returnValue = await controller.doGet({})
      Code.expect(showViewSpy.called).to.be.true()
      Code.expect(returnValue).to.be.true()
    })

    lab.test('GET provides valid selected form value to the view - yes', async () => {
      await controller.doGet({ payload: { 'meet-standards': 'yes' } })
      Code.expect(showViewSpy.args[0][0].pageContext.yesSelected).to.be.true()
      Code.expect(showViewSpy.args[0][0].pageContext.noSelected).to.not.exist()
    })

    lab.test('GET provides valid selected form value to the view - no', async () => {
      await controller.doGet({ payload: { 'meet-standards': 'no' } })
      Code.expect(showViewSpy.args[0][0].pageContext.yesSelected).to.not.exist()
      Code.expect(showViewSpy.args[0][0].pageContext.noSelected).to.be.true()
    })

    lab.test(`GET doesn't provide invalid value to the view`, async () => {
      await controller.doGet({ payload: { 'meet-standards': 'invalid' } })
      Code.expect(showViewSpy.args[0][0].pageContext).to.be.empty()
    })

    lab.test('GET provides valid saved value to the view - yes', async () => {
      // applicationAnswerStub.resolves(new ApplicationAnswer({ answerCode: 'yes' }))
      dataStoreStub.resolves(new DataStore({ data: { 'meet-hazardous-waste-standards': 'yes' } }))
      await controller.doGet({})
      Code.expect(showViewSpy.args[0][0].pageContext.yesSelected).to.be.true()
      Code.expect(showViewSpy.args[0][0].pageContext.noSelected).to.not.exist()
    })

    lab.test('GET provides valid saved value to the view - no', async () => {
      // applicationAnswerStub.resolves(new ApplicationAnswer({ answerCode: 'no' }))
      dataStoreStub.resolves(new DataStore({ data: { 'meet-hazardous-waste-standards': 'no' } }))
      await controller.doGet({})
      Code.expect(showViewSpy.args[0][0].pageContext.yesSelected).to.not.exist()
      Code.expect(showViewSpy.args[0][0].pageContext.noSelected).to.be.true()
    })

    lab.test(`GET doesn't provide non-existent saved value to the view`, async () => {
      // applicationAnswerStub.resolves(undefined)
      await controller.doGet({})
      Code.expect(showViewSpy.args[0][0].pageContext).to.be.empty()
    })

    lab.test(`GET doesn't provide missing saved value to the view`, async () => {
      // applicationAnswerStub.resolves(new ApplicationAnswer({ answerCode: undefined }))
      dataStoreStub.resolves(new DataStore({ data: { 'meet-hazardous-waste-standards': undefined } }))
      await controller.doGet({})
      Code.expect(showViewSpy.args[0][0].pageContext).to.be.empty()
    })

    lab.test(`GET doesn't provide empty saved value to the view`, async () => {
      // applicationAnswerStub.resolves(new ApplicationAnswer({ answerCode: '' }))
      dataStoreStub.resolves(new DataStore({ data: { 'meet-hazardous-waste-standards': '' } }))
      await controller.doGet({})
      Code.expect(showViewSpy.args[0][0].pageContext).to.be.empty()
    })
  })

  lab.experiment('POST:', () => {
    let redirectSpy
    // let saveApplicationAnswerSpy
    let saveDataStoreSpy
    let request
    lab.beforeEach(() => {
      request = { payload: {} }
      redirectSpy = sandbox.stub(Controller.prototype, 'redirect')
      // saveApplicationAnswerSpy = sandbox.stub(ApplicationAnswer.prototype, 'save')
      saveDataStoreSpy = sandbox.stub(DataStore.prototype, 'save')
    })

    lab.test('meeting standard correctly saves and redirects to default next path', async () => {
      request.payload = { 'meet-standards': 'yes' }
      await controller.doPost(request)
      // Code.expect(saveApplicationAnswerSpy.called).to.be.true()
      Code.expect(saveDataStoreSpy.called).to.be.true()
      Code.expect(redirectSpy.called).to.be.true()
      Code.expect(redirectSpy.args[0][0].path).to.not.exist()
    })

    lab.test('not meeting standard correctly saves and redirects to proposal upload path', async () => {
      request.payload = { 'meet-standards': 'no' }
      await controller.doPost(request)
      // Code.expect(saveApplicationAnswerSpy.called).to.be.true()
      Code.expect(saveDataStoreSpy.called).to.be.true()
      Code.expect(redirectSpy.called).to.be.true()
      Code.expect(redirectSpy.args[0][0].path).to.equal('/hazardous-waste/proposal/upload')
    })
  })
})
