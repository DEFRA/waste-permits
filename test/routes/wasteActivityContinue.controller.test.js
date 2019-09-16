'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseController = require('../../src/controllers/base.controller')
const Controller = require('../../src/controllers/wasteActivityContinue.controller')
const RecoveryService = require('../../src/services/recovery.service')
const WasteActivities = require('../../src/models/wasteActivities.model')

lab.experiment('Waste activity add or continue controller tests:', () => {
  let sandbox
  let controller

  lab.beforeEach(() => {
    // controller = new Controller({ route: { previousRoute: 'FACILITY_TYPE' } })
    controller = new Controller({ route: {} })

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()
    sandbox.stub(RecoveryService, 'createApplicationContext').resolves({})
    sandbox.stub(BaseController.prototype, 'createPageContext').returns({})
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
      const returnValue = await controller.doGet()
      Code.expect(showViewSpy.called).to.be.true()
      Code.expect(returnValue).to.be.true()
    })

    lab.test('GET supplies correct activities to view', async () => {
      sandbox.stub(WasteActivities.prototype, 'wasteActivitiesValues').value([{}])
      await controller.doGet()
      const args = showViewSpy.args[0]
      const pageContext = args[0].pageContext
      Code.expect(pageContext).to.exist()
      Code.expect(pageContext.activities).to.exist()
      Code.expect(pageContext.activities.length).to.equal(1)
    })

    lab.test('GET correctly identifies that no more activities can be added', async () => {
      sandbox.stub(WasteActivities.prototype, 'wasteActivitiesValues').value([{}])
      sandbox.stub(WasteActivities.prototype, 'isFull').value(true)
      await controller.doGet()
      const args = showViewSpy.args[0]
      const pageContext = args[0].pageContext
      Code.expect(pageContext).to.exist()
      Code.expect(pageContext.canAddMore).to.be.false()
    })
  })

  lab.experiment('POST:', () => {
    let redirectSpy
    let deleteWasteActivitySpy
    let saveWasteActivitiesSpy
    let request
    lab.beforeEach(() => {
      request = { payload: {} }
      redirectSpy = sandbox.stub(Controller.prototype, 'redirect')
      deleteWasteActivitySpy = sandbox.stub(WasteActivities.prototype, 'deleteWasteActivity')
      saveWasteActivitiesSpy = sandbox.stub(WasteActivities.prototype, 'save')
    })

    lab.test('choosing to add an activity redirects to the activity page', async () => {
      request.payload['add-activity'] = 'add-activity'
      await controller.doPost(request)
      Code.expect(redirectSpy.called).to.be.true()
      Code.expect(redirectSpy.args[0][0].path).to.equal('/waste-activity')
    })

    lab.test('delete activity invokes model', async () => {
      deleteWasteActivitySpy.returns(true)
      request.payload['delete-activity'] = '0'
      await controller.doPost(request)
      Code.expect(deleteWasteActivitySpy.called).to.be.true()
      Code.expect(saveWasteActivitiesSpy.called).to.be.true()
    })

    lab.test('delete activity only saves model if activity is actually deleted', async () => {
      request.payload['delete-activity'] = '0'
      await controller.doPost(request)
      deleteWasteActivitySpy.returns(false)
      Code.expect(deleteWasteActivitySpy.called).to.be.true()
      Code.expect(saveWasteActivitiesSpy.called).to.not.be.true()
    })

    lab.test('choosing to delete an activity redirects to the activity page if there are no activities left', async () => {
      sandbox.stub(WasteActivities.prototype, 'wasteActivitiesLength').value(0)
      request.payload['delete-activity'] = '0'
      await controller.doPost(request)
      Code.expect(redirectSpy.called).to.be.true()
      Code.expect(redirectSpy.args[0][0].path).to.equal('/waste-activity')
    })

    lab.test('choosing to delete an activity redirects back to this location if there are still activities', async () => {
      sandbox.stub(WasteActivities.prototype, 'wasteActivitiesLength').value(1)
      request.payload['delete-activity'] = '1'
      await controller.doPost(request)
      Code.expect(redirectSpy.called).to.be.true()
      Code.expect(redirectSpy.args[0][0].path).to.equal('/waste-activity-continue')
    })

    lab.test('when just confirming, redirects to name page if duplicate activities', async () => {
      sandbox.stub(WasteActivities.prototype, 'hasDuplicateWasteActivities').value(true)
      await controller.doPost(request)
      Code.expect(redirectSpy.called).to.be.true()
      Code.expect(redirectSpy.args[0][0].path).to.equal('/waste-activity-name')
    })

    lab.test('when just confirming, redirects to default next path if no duplicates', async () => {
      sandbox.stub(WasteActivities.prototype, 'hasDuplicateWasteActivities').value(false)
      await controller.doPost(request)
      Code.expect(redirectSpy.called).to.be.true()
      Code.expect(redirectSpy.args[0][0].path).to.not.exist()
    })
  })
})
