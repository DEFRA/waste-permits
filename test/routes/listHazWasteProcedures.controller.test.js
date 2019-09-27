'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseController = require('../../src/controllers/base.controller')
const Controller = require('../../src/controllers/listHazWasteProcedures.controller')
const RecoveryService = require('../../src/services/recovery.service')
// TODO: Replace with this stub code when the controller is changed to use application answers
//  const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')
const DataStore = require('../../src/models/dataStore.model')

lab.experiment('List hazardous waste procedures controller tests:', () => {
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

    lab.test('GET provides entered form value to the view', async () => {
      await controller.doGet({ payload: { 'procedures-list': 'Some procedures' } })
      Code.expect(showViewSpy.args[0][0].pageContext.formValues['procedures-list']).to.equal('Some procedures')
    })

    lab.test('GET provides any blank entered form value to the view', async () => {
      await controller.doGet({ payload: {} })
      Code.expect(showViewSpy.args[0][0].pageContext.formValues).to.exist()
    })

    lab.test('GET provides saved value to the view', async () => {
      // applicationAnswerStub.resolves(new ApplicationAnswer({ answerText: 'Some procedures' }))
      dataStoreStub.resolves(new DataStore({ data: { 'hazardous-waste-procedures': 'Some procedures' } }))
      await controller.doGet({})
      Code.expect(showViewSpy.args[0][0].pageContext.formValues['procedures-list']).to.equal('Some procedures')
    })

    lab.test(`GET doesn't provide non-existent saved value to the view`, async () => {
      // applicationAnswerStub.resolves(undefined)
      await controller.doGet({})
      Code.expect(showViewSpy.args[0][0].pageContext.formValues['procedures-list']).to.not.exist()
    })

    lab.test(`GET doesn't provide missing saved value to the view`, async () => {
      // applicationAnswerStub.resolves(new ApplicationAnswer({ answerText: undefined }))
      dataStoreStub.resolves(new DataStore({ data: { 'hazardous-waste-procedures': undefined } }))
      await controller.doGet({})
      Code.expect(showViewSpy.args[0][0].pageContext.formValues['procedures-list']).to.not.exist()
    })

    lab.test(`GET provides empty saved value to the view`, async () => {
      // applicationAnswerStub.resolves(new ApplicationAnswer({ answerText: '' }))
      dataStoreStub.resolves(new DataStore({ data: { 'hazardous-waste-procedures': '' } }))
      await controller.doGet({})
      Code.expect(showViewSpy.args[0][0].pageContext.formValues['procedures-list']).to.equal('')
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

    lab.test('entering valid value saves and redirects to default next path', async () => {
      request.payload = { 'procedures-list': 'Some procedures' }
      await controller.doPost(request)
      // Code.expect(saveApplicationAnswerSpy.called).to.be.true()
      Code.expect(saveDataStoreSpy.called).to.be.true()
      Code.expect(redirectSpy.called).to.be.true()
      Code.expect(redirectSpy.args[0][0].path).to.not.exist()
    })
  })
})
