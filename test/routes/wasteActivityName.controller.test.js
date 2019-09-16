'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseController = require('../../src/controllers/base.controller')
const Controller = require('../../src/controllers/wasteActivityName.controller')
const RecoveryService = require('../../src/services/recovery.service')
const WasteActivities = require('../../src/models/wasteActivities.model')
const WasteActivityNameValidator = require('../../src/validators/wasteActivityName.validator')

lab.experiment('Name these waste activities controller tests:', () => {
  let sandbox
  let controller
  let pageContextStub

  lab.beforeEach(() => {
    // controller = new Controller({ route: { previousRoute: 'FACILITY_TYPE' } })
    controller = new Controller({ route: {} })

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()
    sandbox.stub(RecoveryService, 'createApplicationContext').resolves({})
    pageContextStub = sandbox.stub(BaseController.prototype, 'createPageContext')
    pageContextStub.returns({})
    sandbox.stub(WasteActivities, 'get').resolves(new WasteActivities([], []))
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

    lab.test('GET supplies correct activities to view', async () => {
      sandbox.stub(WasteActivities.prototype, 'duplicateWasteActivitiesValues').value([{ index: 1 }])
      await controller.doGet({})
      const args = showViewSpy.args[0]
      const pageContext = args[0].pageContext
      Code.expect(pageContext.activities[0].formFieldId).to.equal('activity-name-1')
    })

    lab.test('GET supplies error info to view', async () => {
      sandbox.stub(WasteActivities.prototype, 'duplicateWasteActivitiesValues').value([{ index: 1 }])
      pageContextStub.returns({ errors: { 'activity-name-1': ['error'] } })
      await controller.doGet({})
      const args = showViewSpy.args[0]
      const pageContext = args[0].pageContext
      Code.expect(pageContext.activities[0].formErrors).to.equal(['error'])
    })

    lab.test('GET provides entered name to view', async () => {
      sandbox.stub(WasteActivities.prototype, 'duplicateWasteActivitiesValues').value([{ index: 1, referenceName: 'old name' }])
      await controller.doGet({ payload: { 'activity-name-1': 'new name' } })
      const args = showViewSpy.args[0]
      const pageContext = args[0].pageContext
      Code.expect(pageContext.activities[0].referenceName).to.equal('new name')
    })
  })

  lab.experiment('POST:', () => {
    let redirectSpy
    let validateSpy
    let setReferenceNameSpy
    let saveWasteActivitiesSpy
    let request
    lab.beforeEach(() => {
      request = { payload: {} }
      redirectSpy = sandbox.stub(Controller.prototype, 'redirect')
      sandbox.stub(WasteActivities.prototype, 'duplicateWasteActivitiesValues').value([{ index: 1 }, { index: 2 }])
      validateSpy = sandbox.stub()
      sandbox.stub(WasteActivityNameValidator.prototype, 'formValidators').value({ validate: validateSpy })
      controller.validator = new WasteActivityNameValidator()
      setReferenceNameSpy = sandbox.stub(WasteActivities.prototype, 'setWasteActivityReferenceName')
      saveWasteActivitiesSpy = sandbox.stub(WasteActivities.prototype, 'save')
    })

    lab.test('providing values correctly sets names, saves and redirects to default next path', async () => {
      request.payload = { 'activity-name-1': 'New name 1', 'activity-name-2': 'New name 2' }
      validateSpy.returns({})
      await controller.doPost(request)
      Code.expect(validateSpy.called).to.be.true()
      Code.expect(setReferenceNameSpy.callCount).to.equal(2)
      Code.expect(setReferenceNameSpy.args[0][0]).to.equal(1)
      Code.expect(setReferenceNameSpy.args[0][1]).to.equal('New name 1')
      Code.expect(setReferenceNameSpy.args[1][0]).to.equal(2)
      Code.expect(setReferenceNameSpy.args[1][1]).to.equal('New name 2')
      Code.expect(saveWasteActivitiesSpy.called).to.be.true()
      Code.expect(redirectSpy.called).to.be.true()
      Code.expect(redirectSpy.args[0][0].path).to.not.exist()
    })

    lab.test('failing validation passes error details to the get method', async () => {
      const doGetSpy = sandbox.stub(Controller.prototype, 'doGet')
      request.payload = { 'activity-name-1': '', 'activity-name-2': '' }
      validateSpy.returns({ error: 'This is the error' })
      await controller.doPost(request)
      Code.expect(validateSpy.called).to.be.true()
      Code.expect(setReferenceNameSpy.called).to.be.false()
      Code.expect(saveWasteActivitiesSpy.called).to.be.false()
      Code.expect(doGetSpy.called).to.be.true()
      Code.expect(doGetSpy.args[0][2]).to.equal('This is the error')
    })
  })
})
