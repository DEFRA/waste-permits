'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const AssessmentList = require('../../../src/models/triage/assessmentList.model')

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
const DUMMY_ACTIVITY = [{
  id: 'activity-1',
  canApplyOnline: true
}]

const INVALID_ASSESSMENT = 'invalid-assessment'
const DUMMY_ASSESSMENT = 'assessment-1'
const DUMMY_ASSESSMENT_TEXT = 'Assessment 1'
const DUMMY_ASSESSMENT2 = 'assessment-2'

const DUMMY_ASSESSMENTS = [{
  id: DUMMY_ASSESSMENT,
  text: DUMMY_ASSESSMENT_TEXT,
  canApplyOnline: true
}, {
  id: DUMMY_ASSESSMENT2,
  canApplyOnline: false
}]

let assessmentList

lab.beforeEach(async () => {
  assessmentList = await AssessmentList.createList({}, BESPOKE, LTD_CO, WASTE, DUMMY_ACTIVITY)
  assessmentList.assessmentsArray = DUMMY_ASSESSMENTS
})

lab.experiment('Triage activity model tests:', () => {
  // Need to replace this test once we are able to retrieve assessments
  lab.test('includes expected assessments', async () => {
    Code.expect(assessmentList.ids).to.include([DUMMY_ASSESSMENT, DUMMY_ASSESSMENT2])
  })

  lab.experiment('Select:', () => {
    lab.test('can select an assessment', async () => {
      const dummyAssessmentList = assessmentList.getListFilteredByIds([DUMMY_ASSESSMENT])
      Code.expect(dummyAssessmentList.items.length).to.equal(1)
      const dummyAssessmentItem = dummyAssessmentList.entry(DUMMY_ASSESSMENT)
      Code.expect(dummyAssessmentItem).to.exist()
      Code.expect(dummyAssessmentItem.id).to.equal(DUMMY_ASSESSMENT)
      Code.expect(dummyAssessmentItem.text).to.equal(DUMMY_ASSESSMENT_TEXT)
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
      const wasteList = assessmentList.getListFilteredByIds([DUMMY_ASSESSMENT])
      Code.expect(wasteList.canApplyOnline).to.be.true()
    })
    lab.test('cannot be applied for online if not all activities can be', async () => {
      const instList = assessmentList.getListFilteredByIds([DUMMY_ASSESSMENT2])
      Code.expect(instList.canApplyOnline).to.be.false()
    })
    lab.test('invalid or missing activities cannot be applied for online', async () => {
      const invalidList = assessmentList.getListFilteredByIds([INVALID_ASSESSMENT])
      Code.expect(invalidList.canApplyOnline).to.be.false()
    })
  })
})
