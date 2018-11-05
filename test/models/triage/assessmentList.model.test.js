'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const AssessmentList = require('../../../src/models/triage/assessmentList.model')
const ItemEntity = require('../../../src/persistence/entities/item.entity')

const BESPOKE = [{
  id: 'bespoke',
  canApplyOnline: true
}]
const LTD_CO = [{
  id: 'limited-company',
  canApplyOnline: true
}]
const WASTE = [{
  id: 'waste',
  canApplyOnline: true
}]
const DUMMY_ACTIVITY = [{
  id: 'activity-1',
  canApplyOnline: true
}]

const INVALID_ASSESSMENT = 'invalid-assessment'

const fakeItemEntities = [{
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
let assessmentList

lab.beforeEach(async () => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()
  sandbox.stub(ItemEntity, 'listAssessments').callsFake(async () => fakeItemEntities)

  assessmentList = await AssessmentList.createList({}, BESPOKE, LTD_CO, WASTE, DUMMY_ACTIVITY, { optionalAssessments: true })
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Triage assessment model tests:', () => {
  lab.test('includes only expected assessments', async () => {
    Code.expect(assessmentList.ids).to.include(['assessment-1', 'assessment-2', 'assessment-3'])
    Code.expect(assessmentList.ids).to.not.include(['assessment-4'])
  })

  lab.experiment('Select:', () => {
    lab.test('can select an assessment', async () => {
      const dummyAssessmentList = assessmentList.getListFilteredByIds(['assessment-1'])
      Code.expect(dummyAssessmentList.items.length).to.equal(1)
      const dummyAssessmentItem = dummyAssessmentList.entry('assessment-1')
      Code.expect(dummyAssessmentItem).to.exist()
      Code.expect(dummyAssessmentItem.id).to.equal('assessment-1')
      Code.expect(dummyAssessmentItem.text).to.equal('Assessment 1')
    })
    lab.test('cannot select invalid assessment', async () => {
      const invalidList = assessmentList.getListFilteredByIds([INVALID_ASSESSMENT])
      Code.expect(invalidList.items.length).to.equal(0)
      const invalidItem = invalidList.entry(INVALID_ASSESSMENT)
      Code.expect(invalidItem).to.not.exist()
    })
  })

  lab.experiment('Available online:', () => {
    lab.test('cannot all be applied for online', async () => {
      Code.expect(assessmentList.canApplyOnline).to.be.false()
    })
    lab.test('can be applied for online if all assessments can be', async () => {
      const wasteList = assessmentList.getListFilteredByIds(['assessment-1', 'assessment-2'])
      Code.expect(wasteList.canApplyOnline).to.be.true()
    })
    lab.test('cannot be applied for online if not all assessments can be', async () => {
      const instList = assessmentList.getListFilteredByIds(['assessment-2', 'assessment-3'])
      Code.expect(instList.canApplyOnline).to.be.false()
    })
    lab.test('invalid or missing assessments cannot be applied for online', async () => {
      const invalidList = assessmentList.getListFilteredByIds([INVALID_ASSESSMENT])
      Code.expect(invalidList.canApplyOnline).to.be.false()
    })
  })
})
