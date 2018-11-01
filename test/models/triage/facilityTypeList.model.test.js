'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const FacilityTypeList = require('../../../src/models/triage/facilityTypeList.model')
const ActivityList = require('../../../src/models/triage/activityList.model')

const BESPOKE = [{
  id: 'bespoke',
  canApplyOnline: true
}]
const LTD_CO = [{
  id: 'limited-company',
  canApplyOnline: true
}]

const INVALID_FACILITY_TYPE = 'invalid-facility-type'
const WASTE = 'waste-operation'
const INSTALLATION = 'installation'

const FAKE_ACTIVITIES = [{
  id: 'fake1',
  text: 'Fake 1',
  activityCode: '1.fake.code',
  canApplyOnline: true
}, {
  id: 'fake2',
  text: 'Fake 2',
  activityCode: '2.fake.code',
  canApplyOnline: false
}]

const DUMMY_FACILITIES = [{
  id: 'dummy1',
  typeText: 'Dummy1'
}, {
  id: 'dummy2',
  typeText: 'Dummy2'
}, {
  id: 'dummy3',
  typeText: 'Dummy3'
}]
const DUMMY_TYPE_TEXT_1 = 'Dummy1'
const DUMMY_TYPE_TEXT_2 = 'Dummy1 and Dummy2'
const DUMMY_TYPE_TEXT_3 = 'Dummy1, Dummy2 and Dummy3'

let sandbox
let facilityTypeList
let fakeActivities

lab.beforeEach(async () => {
  facilityTypeList = await FacilityTypeList.createList({}, BESPOKE, LTD_CO)
})

lab.experiment('Triage facility type model tests:', () => {
  lab.test('includes installations and waste operations', async () => {
    Code.expect(facilityTypeList.ids).to.include([INSTALLATION, WASTE])
  })

  lab.experiment('Select:', () => {
    lab.test('can select waste operation', async () => {
      const wasteList = facilityTypeList.getListFilteredByIds([WASTE])
      Code.expect(wasteList.items.length).to.equal(1)
      const wasteItem = wasteList.entry(WASTE)
      Code.expect(wasteItem).to.exist()
      Code.expect(wasteItem.id).to.equal(WASTE)
      Code.expect(wasteItem.text).to.exist()
      Code.expect(wasteItem.text).to.not.be.empty()
    })
    lab.test('can select installation', async () => {
      const instList = facilityTypeList.getListFilteredByIds([INSTALLATION])
      Code.expect(instList.items.length).to.equal(1)
      const instItem = instList.entry(INSTALLATION)
      Code.expect(instItem).to.exist()
      Code.expect(instItem.id).to.equal(INSTALLATION)
      Code.expect(instItem.text).to.exist()
      Code.expect(instItem.text).to.not.be.empty()
    })
    lab.test('cannot select invalid facility type', async () => {
      const invalidList = facilityTypeList.getListFilteredByIds([INVALID_FACILITY_TYPE])
      Code.expect(invalidList.items.length).to.equal(0)
      const invalidItem = invalidList.entry(INVALID_FACILITY_TYPE)
      Code.expect(invalidItem).to.not.exist()
    })
  })

  lab.test('correctly displays type text', async () => {
    facilityTypeList = new FacilityTypeList({}, BESPOKE, LTD_CO, DUMMY_FACILITIES)
    let filteredList
    filteredList = facilityTypeList.getListFilteredByIds([DUMMY_FACILITIES[0].id])
    Code.expect(filteredList.typeText).to.equal(DUMMY_TYPE_TEXT_1)
    filteredList = facilityTypeList.getListFilteredByIds([DUMMY_FACILITIES[0].id, DUMMY_FACILITIES[1].id])
    Code.expect(filteredList.typeText).to.equal(DUMMY_TYPE_TEXT_2)
    filteredList = facilityTypeList.getListFilteredByIds([DUMMY_FACILITIES[0].id, DUMMY_FACILITIES[1].id, DUMMY_FACILITIES[2].id])
    Code.expect(filteredList.typeText).to.equal(DUMMY_TYPE_TEXT_3)
  })

  lab.experiment('Available online:', () => {
    lab.test('cannot all be applied for online', async () => {
      Code.expect(facilityTypeList.canApplyOnline).to.be.false()
    })
    lab.test('waste operation can be applied for online', async () => {
      const wasteList = facilityTypeList.getListFilteredByIds([WASTE])
      Code.expect(wasteList.canApplyOnline).to.be.true()
    })
    lab.test('installation cannot be applied for online', async () => {
      const instList = facilityTypeList.getListFilteredByIds([INSTALLATION])
      Code.expect(instList.canApplyOnline).to.be.false()
    })
    lab.test('invalid or missing permit holder type cannot be applied for online', async () => {
      const invalidList = facilityTypeList.getListFilteredByIds([INVALID_FACILITY_TYPE])
      Code.expect(invalidList.canApplyOnline).to.be.false()
    })
  })

  lab.experiment('Provide correct activities:', () => {
    lab.beforeEach(() => {
      fakeActivities = FAKE_ACTIVITIES

      // Create a sinon sandbox to stub methods
      sandbox = sinon.createSandbox()
      sandbox.stub(ActivityList, 'createList').value(async () => new ActivityList(null, null, null, null, fakeActivities))
    })

    lab.afterEach(() => {
      // Restore the sandbox to make sure the stubs are removed correctly
      sandbox.restore()
    })
    lab.test('returns a list', async () => {
      const filteredFacilityTypeList = facilityTypeList.getListFilteredByIds([WASTE])
      const activityList = await filteredFacilityTypeList.getActivityList()
      Code.expect(activityList.items.length).to.equal(fakeActivities.length)
    })
  })
})
