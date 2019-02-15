'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const TriageList = require('../../../src/models/triage/triageList.model')
const ItemEntity = require('../../../src/persistence/entities/item.entity')

const INVALID_PERMIT_TYPE = 'invalid-permit-type'

const BESPOKE = [{
  id: 'bespoke',
  canApplyOnline: true
}]
const SR = [{
  id: 'standard-rules',
  canApplyOnline: true
}]
const LTD_CO = [{
  id: 'limited-company',
  canApplyOnline: true
}]
const OTHER = [{
  id: 'other-organisation',
  canApplyOnline: true
}]
const INSTALLATION = [{
  id: 'installation',
  canApplyOnline: false
}]
const WASTE = [{
  id: 'waste',
  canApplyOnline: true
}]

const DUMMY_FACILITIES = [{
  id: 'dummy1',
  facilityTypeText: 'Dummy1'
}, {
  id: 'dummy2',
  facilityTypeText: 'Dummy2'
}, {
  id: 'dummy3',
  facilityTypeText: 'Dummy3'
}]
const DUMMY_TYPE_TEXT_1 = 'Dummy1'
const DUMMY_TYPE_TEXT_2 = 'Dummy1 and Dummy2'
const DUMMY_TYPE_TEXT_3 = 'Dummy1, Dummy2 and Dummy3'

const DUMMY_ACTIVITY = [{
  id: 'activity-1',
  canApplyOnline: true
}]
const INVALID_ACTIVITY = 'invalid-activity'

const fakeWasteActivityItemEntities = [{
  id: 'ID1',
  shortName: 'activity-1',
  itemName: 'Activity 1',
  code: '1.activity.code',
  canApplyFor: true,
  canApplyOnline: true
}, {
  id: 'ID2',
  shortName: 'activity-2',
  itemName: 'Activity 2',
  code: '2.activity.code',
  canApplyFor: true,
  canApplyOnline: true
}, {
  id: 'ID3',
  shortName: 'activity-3',
  itemName: 'Activity 3',
  code: '3.activity.code',
  canApplyFor: true,
  canApplyOnline: false
}, {
  id: 'ID4',
  shortName: 'activity-4',
  itemName: 'Activity 4',
  code: '4.activity.code',
  canApplyFor: false,
  canApplyOnline: false
}]
const fakeWasteAssessmentItemEntities = [{
  id: 'ID1',
  shortName: 'assessment-1',
  itemName: 'Assessment 1',
  canApplyFor: true,
  canApplyOnline: true
}, {
  id: 'ID2',
  shortName: 'assessment-2',
  itemName: 'Assessment 2',
  canApplyFor: true,
  canApplyOnline: true
}, {
  id: 'ID3',
  shortName: 'assessment-3',
  itemName: 'Assessment 3',
  canApplyFor: true,
  canApplyOnline: false
}, {
  id: 'ID4',
  shortName: 'assessment-4',
  itemName: 'Assessment 4',
  canApplyFor: false,
  canApplyOnline: false
}]
let sandbox
let permitTypeList
let permitHolderTypeList
let facilityTypeList
let wasteActivityList
let wasteAssessmentList

lab.beforeEach(async () => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()
  sandbox.stub(ItemEntity, 'listWasteActivitiesForFacilityTypes').callsFake(async () => fakeWasteActivityItemEntities)
  sandbox.stub(ItemEntity, 'getById').callsFake(async (entityContext, entityId) => fakeWasteActivityItemEntities.find(({ id }) => id === entityId))
  sandbox.stub(ItemEntity, 'listWasteAssessments').callsFake(async () => fakeWasteAssessmentItemEntities)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Triage list model tests:', () => {
  lab.test('only includes bespoke and standard rules', async () => {
    permitTypeList = await TriageList.createPermitTypesList({})
    Code.expect(permitTypeList.ids).to.only.include([BESPOKE[0].id, SR[0].id])
  })

  lab.test('includes limited companies and other organisations', async () => {
    permitHolderTypeList = await TriageList.createPermitHolderTypesList({})
    Code.expect(permitHolderTypeList.ids).to.include([LTD_CO[0].id, OTHER[0].id])
  })

  lab.test('includes installations and waste operations', async () => {
    facilityTypeList = await TriageList.createFacilityTypesList({}, { selectedPermitTypes: new TriageList(BESPOKE) })
    Code.expect(facilityTypeList.ids).to.include([INSTALLATION[0].id, WASTE[0].id])
  })

  lab.test('no facility types for standard rules', async () => {
    facilityTypeList = await TriageList.createFacilityTypesList({}, { selectedPermitTypes: new TriageList(SR) })
    Code.expect(facilityTypeList.items).to.be.empty()
  })

  lab.test('includes only expected waste activities', async () => {
    wasteActivityList = await TriageList.createWasteActivitiesList({}, { selectedPermitTypes: new TriageList(BESPOKE), selectedFacilityTypes: new TriageList(WASTE) })
    Code.expect(wasteActivityList.ids).to.include(['activity-1', 'activity-2', 'activity-3'])
    Code.expect(wasteActivityList.ids).to.not.include(['activity-4'])
  })

  lab.test('no waste activities for standard rules', async () => {
    wasteActivityList = await TriageList.createWasteActivitiesList({}, { selectedPermitTypes: new TriageList(SR), selectedFacilityTypes: new TriageList(WASTE) })
    Code.expect(wasteActivityList.items).to.be.empty()
  })

  lab.test('no waste activities without a facility', async () => {
    wasteActivityList = await TriageList.createWasteActivitiesList({}, { selectedPermitTypes: new TriageList(BESPOKE), selectedFacilityTypes: new TriageList([]) })
    Code.expect(wasteActivityList.items).to.be.empty()
  })

  lab.test('includes all expected optional waste assessments', async () => {
    wasteAssessmentList = await TriageList.createOptionalWasteAssessmentsList({}, { selectedWasteActivities: new TriageList(DUMMY_ACTIVITY) })
    Code.expect(wasteAssessmentList.ids).to.include(['assessment-1', 'assessment-2', 'assessment-3'])
    Code.expect(wasteAssessmentList.ids).to.not.include(['assessment-4'])
  })

  lab.test('no optional waste assessments without activities', async () => {
    wasteAssessmentList = await TriageList.createOptionalWasteAssessmentsList({}, { selectedWasteActivities: new TriageList([]) })
    Code.expect(wasteAssessmentList.items).to.be.empty()
  })

  lab.test('no included waste assessments', async () => {
    wasteAssessmentList = await TriageList.createIncludedWasteAssessmentsList({}, { selectedWasteActivities: new TriageList(DUMMY_ACTIVITY) })
    Code.expect(wasteAssessmentList.items).to.be.empty()
  })

  lab.experiment('Select:', () => {
    lab.beforeEach(async () => {
      permitTypeList = await TriageList.createPermitTypesList({})
    })
    lab.test('can select', async () => {
      const bespokeList = permitTypeList.getListFilteredByIds([BESPOKE[0].id])
      Code.expect(bespokeList.items.length).to.equal(1)
      const bespokeItem = bespokeList.entry(BESPOKE[0].id)
      Code.expect(bespokeItem).to.exist()
      Code.expect(bespokeItem.id).to.equal(BESPOKE[0].id)
      Code.expect(bespokeItem.text).to.exist()
      Code.expect(bespokeItem.text).to.not.be.empty()
    })
    lab.test('cannot select invalid value', async () => {
      const invalidList = permitTypeList.getListFilteredByIds([INVALID_PERMIT_TYPE])
      Code.expect(invalidList.items.length).to.equal(0)
      const invalidItem = invalidList.entry(INVALID_PERMIT_TYPE)
      Code.expect(invalidItem).to.not.exist()
    })
  })

  lab.test('correctly displays facility type text', async () => {
    facilityTypeList = new TriageList(DUMMY_FACILITIES)
    let filteredList
    filteredList = facilityTypeList.getListFilteredByIds([DUMMY_FACILITIES[0].id])
    Code.expect(filteredList.facilityTypeText).to.equal(DUMMY_TYPE_TEXT_1)
    filteredList = facilityTypeList.getListFilteredByIds([DUMMY_FACILITIES[0].id, DUMMY_FACILITIES[1].id])
    Code.expect(filteredList.facilityTypeText).to.equal(DUMMY_TYPE_TEXT_2)
    filteredList = facilityTypeList.getListFilteredByIds([DUMMY_FACILITIES[0].id, DUMMY_FACILITIES[1].id, DUMMY_FACILITIES[2].id])
    Code.expect(filteredList.facilityTypeText).to.equal(DUMMY_TYPE_TEXT_3)
  })

  lab.experiment('Available online:', () => {
    lab.beforeEach(async () => {
      wasteActivityList = await TriageList.createWasteActivitiesList({}, { selectedPermitTypes: new TriageList(BESPOKE), selectedFacilityTypes: new TriageList(WASTE) })
    })
    lab.test('cannot all be applied for online', async () => {
      Code.expect(wasteActivityList.canApplyOnline).to.be.false()
    })
    lab.test('can be applied for online if all waste activities can be', async () => {
      const onlineList = wasteActivityList.getListFilteredByIds(['activity-1', 'activity-2'])
      Code.expect(onlineList.canApplyOnline).to.be.true()
    })
    lab.test('cannot be applied for online if not all waste activities can be', async () => {
      const offlineList = wasteActivityList.getListFilteredByIds(['activity-2', 'activity-3'])
      Code.expect(offlineList.canApplyOnline).to.be.false()
    })
    lab.test('invalid or missing waste activities cannot be applied for online', async () => {
      const invalidList = wasteActivityList.getListFilteredByIds([INVALID_ACTIVITY])
      Code.expect(invalidList.canApplyOnline).to.be.false()
    })
  })
})
