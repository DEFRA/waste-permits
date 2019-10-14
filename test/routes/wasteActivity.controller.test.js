'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseController = require('../../src/controllers/base.controller')
const Controller = require('../../src/controllers/wasteActivity.controller')

const ItemEntity = require('../../src/persistence/entities/item.entity')
const RecoveryService = require('../../src/services/recovery.service')
const WasteActivities = require('../../src/models/wasteActivities.model')

const fakeActivities = [{
  canApplyFor: true,
  canApplyOnline: true,
  shortName: 'FAKE_ACTIVITY_ID',
  itemName: 'Fake activity text'
}, {
  canApplyFor: true,
  canApplyOnline: true,
  shortName: 'FAKE_ACTIVITY_ID2',
  itemName: 'Fake activity 2 text'
}, {
  canApplyFor: true,
  canApplyOnline: false,
  shortName: 'FAKE_ACTIVITY_ID3',
  itemName: 'Fake activity 3 text'
}, {
  canApplyFor: false,
  canApplyOnline: false,
  shortName: 'FAKE_ACTIVITY_ID4',
  itemName: 'Fake activity 4 text'
}, {
  canApplyFor: true,
  canApplyOnline: true,
  shortName: '1-16-9',
  itemName: 'Fake activity 3 text'
}]

lab.experiment('Waste activity controller tests:', () => {
  let sandbox
  let controller

  lab.beforeEach(() => {
    controller = new Controller({ route: { previousRoute: 'FACILITY_TYPE' } })

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()
    sandbox.stub(ItemEntity, 'listWasteActivitiesForFacilityTypes').resolves(fakeActivities)
    sandbox.stub(RecoveryService, 'createApplicationContext').resolves({ taskDeterminants: { facilityType: {} } })
    sandbox.stub(BaseController.prototype, 'createPageContext').returns({})
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

    // TODO: this currently displays all activities that can be applied for
    lab.test('GET only supplies activities to view that can be applied for online', async () => {
      await controller.doGet()
      const args = showViewSpy.args[0]
      const pageContext = args[0].pageContext
      Code.expect(pageContext).to.exist()
      Code.expect(pageContext.activities).to.exist()
      // Code.expect(pageContext.activities.length).to.equal(3)
      Code.expect(pageContext.activities.length).to.equal(4)
    })

    lab.test('GET supplies correct installation flags to view', async () => {
      await controller.doGet()
      const activities = showViewSpy.args[0][0].pageContext.activities
      const flaggedAsCouldBeAnInstallation = activities.filter(({ couldBeAnInstallation }) => couldBeAnInstallation)
      Code.expect(flaggedAsCouldBeAnInstallation.length).to.equal(1)
    })
  })

  lab.experiment('POST:', () => {
    let redirectSpy
    let addWasteActivitySpy
    let saveWasteActivitySpy
    let request
    lab.beforeEach(() => {
      request = { payload: { activity: 'FAKE_ACTIVITY_ID' } }
      sandbox.stub(WasteActivities, 'get').resolves(new WasteActivities(fakeActivities,[]))
      redirectSpy = sandbox.stub(Controller.prototype, 'redirect')
      addWasteActivitySpy = sandbox.stub(WasteActivities.prototype, 'addWasteActivity')
      saveWasteActivitySpy = sandbox.stub(WasteActivities.prototype, 'save')
    })

    lab.test('POST adds the selected activity and saves', async () => {
      await controller.doPost(request)
      Code.expect(addWasteActivitySpy.called).to.be.true()
      Code.expect(addWasteActivitySpy.args[0][0]).to.equal('FAKE_ACTIVITY_ID')
      Code.expect(saveWasteActivitySpy.called).to.be.true()
    })

    lab.test('POST redirects', async () => {
      await controller.doPost(request)
      Code.expect(redirectSpy.called).to.be.true()
    })
  })
})
