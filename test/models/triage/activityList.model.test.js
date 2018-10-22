'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const ActivityList = require('../../../src/models/triage/activityList.model')
const ItemEntity = require('../../../src/persistence/entities/item.entity')
const ItemDetailEntity = require('../../../src/persistence/entities/itemDetail.entity')

const BESPOKE = [{
  id: 'bespoke',
  canApplyOnline: true
}]
const LTD_CO = [{
  id: 'limited-company',
  canApplyOnline: true
}]
const WASTE = [{
  id: 'waste-operation',
  canApplyOnline: true
}]

const INVALID_ACTIVITY = 'invalid-activity'

const NUMBER_OF_INCLUDED_ASSESSMENTS = 2
const NUMBER_OF_OPTIONAL_ASSESSMENTS = 2

const fakeItemDetailEntities = [{ itemId: 'ID1' }, { itemId: 'ID1' }, { itemId: 'ID2' }, { itemId: 'ID2' }, { itemId: 'ID3' }, { itemId: 'ID3' }]
const fakeItemEntities = [{
  id: 'ID1',
  itemName: 'activity-1',
  displayName: 'Activity 1',
  code: '1.activity.code',
  canApplyOnline: true
}, {
  id: 'ID2',
  itemName: 'activity-2',
  displayName: 'Activity 2',
  code: '2.activity.code',
  canApplyOnline: true
}, {
  id: 'ID3',
  itemName: 'activity-3',
  displayName: 'Activity 3',
  code: '3.activity.code',
  canApplyOnline: false
}]

let sandbox
let activityList

lab.beforeEach(async () => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()
  sandbox.stub(ItemDetailEntity, 'listActivitiesForFacilityType').callsFake(async () => fakeItemDetailEntities)
  sandbox.stub(ItemEntity, 'getById').callsFake(async (entityContext, entityId) => fakeItemEntities.find(({ id }) => id === entityId))

  activityList = await ActivityList.createList({}, BESPOKE, LTD_CO, WASTE)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Triage activity model tests:', () => {
  // Need to replace this test once we are able to retrieve activities
  lab.test('includes expected activities', async () => {
    Code.expect(activityList.ids).to.include(['activity-1', 'activity-2', 'activity-3'])
  })

  lab.experiment('Select:', () => {
    lab.test('can select an activity', async () => {
      const dummyActivityList = activityList.getListFilteredByIds(['activity-1'])
      Code.expect(dummyActivityList.items.length).to.equal(1)
      const dummyActivityItem = dummyActivityList.entry('activity-1')
      Code.expect(dummyActivityItem).to.exist()
      Code.expect(dummyActivityItem.id).to.equal('activity-1')
      Code.expect(dummyActivityItem.text).to.equal('Activity 1')
    })
    lab.test('cannot select invalid activity', async () => {
      const invalidList = activityList.getListFilteredByIds([INVALID_ACTIVITY])
      Code.expect(invalidList.items.length).to.equal(0)
      const invalidItem = invalidList.entry(INVALID_ACTIVITY)
      Code.expect(invalidItem).to.not.exist()
    })
  })

  lab.experiment('Available online:', () => {
    lab.test('cannot all be applied for online', async () => {
      Code.expect(activityList.canApplyOnline).to.be.false()
    })
    lab.test('can be applied for online if all activities can be', async () => {
      const wasteList = activityList.getListFilteredByIds(['activity-1', 'activity-2'])
      Code.expect(wasteList.canApplyOnline).to.be.true()
    })
    lab.test('cannot be applied for online if not all activities can be', async () => {
      const instList = activityList.getListFilteredByIds(['activity-2', 'activity-3'])
      Code.expect(instList.canApplyOnline).to.be.false()
    })
    lab.test('invalid or missing activities cannot be applied for online', async () => {
      const invalidList = activityList.getListFilteredByIds([INVALID_ACTIVITY])
      Code.expect(invalidList.canApplyOnline).to.be.false()
    })
  })

  lab.experiment('Provide correct assessments:', () => {
    lab.test('full list for all valid activities', async () => {
      const filteredActivityList = activityList.getListFilteredByIds(['activity-1', 'activity-2'])
      const includedAssessmentList = await filteredActivityList.getIncludedAssessmentList()
      const optionalAssessmentList = await filteredActivityList.getOptionalAssessmentList()
      Code.expect(includedAssessmentList.items.length).to.equal(NUMBER_OF_INCLUDED_ASSESSMENTS)
      Code.expect(optionalAssessmentList.items.length).to.equal(NUMBER_OF_OPTIONAL_ASSESSMENTS)
    })
    lab.test('some for any valid activity', async () => {
      const filteredActivityList = activityList.getListFilteredByIds(['activity-1'])
      const includedAssessmentList = await filteredActivityList.getIncludedAssessmentList()
      const optionalAssessmentList = await filteredActivityList.getOptionalAssessmentList()
      Code.expect(includedAssessmentList.items.length).to.not.equal(0)
      Code.expect(optionalAssessmentList.items.length).to.not.equal(0)
    })
    lab.test('none for unavailable activities', async () => {
      const filteredActivityList = activityList.getListFilteredByIds(['activity-3'])
      const includedAssessmentList = await filteredActivityList.getIncludedAssessmentList()
      const optionalAssessmentList = await filteredActivityList.getOptionalAssessmentList()
      Code.expect(includedAssessmentList.items.length).to.equal(0)
      Code.expect(optionalAssessmentList.items.length).to.equal(0)
    })
  })
})
