'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const ApplicationModel = require('../../../src/models/triage/application.model')
const Activity = require('../../../src/models/triage/activity.model')
const Assessment = require('../../../src/models/triage/assessment.model')
const ItemEntity = require('../../../src/persistence/entities/item.entity')
const ApplicationEntity = require('../../../src/persistence/entities/application.entity')
const ApplicationLineEntity = require('../../../src/persistence/entities/applicationLine.entity')

const context = { authToken: 'AUTH_TOKEN' }
const ACTIVITY_ITEM_TYPE_ID = 'ACTIVITY_ITEM_TYPE_ID'
const ASSESSMENT_ITEM_TYPE_ID = 'ASSESSMENT_ITEM_TYPE_ID'

const ITEMS = {
  activities: [{
    id: 'ACTIVITY_ITEM_ID_1',
    shortName: 'activity-1',
    canApplyOnline: true,
    itemTypeId: ACTIVITY_ITEM_TYPE_ID
  }, {
    id: 'ACTIVITY_ITEM_ID_2',
    shortName: 'activity-2',
    canApplyOnline: true,
    itemTypeId: ACTIVITY_ITEM_TYPE_ID
  }, {
    id: 'ACTIVITY_ITEM_ID_3',
    shortName: 'activity-3',
    canApplyOnline: true,
    itemTypeId: ACTIVITY_ITEM_TYPE_ID
  }],
  assessments: [{
    id: 'ASSESSMENT_ITEM_ID_1',
    shortName: 'assessment-1',
    canApplyOnline: true,
    itemTypeId: ASSESSMENT_ITEM_TYPE_ID
  }, {
    id: 'ASSESSMENT_ITEM_ID_2',
    shortName: 'assessment-2',
    canApplyOnline: true,
    itemTypeId: ASSESSMENT_ITEM_TYPE_ID
  }, {
    id: 'ASSESSMENT_ITEM_ID_3',
    shortName: 'assessment-3',
    canApplyOnline: true,
    itemTypeId: ASSESSMENT_ITEM_TYPE_ID
  }]
}

const FAKE_APPLICATION_ID = 'FAKE_APPLICATION_ID'

const { PERMIT_HOLDER_TYPES: DYNAMICS_PERMIT_HOLDER_TYPES } = require('../../../src/dynamics')
const { PERMIT_HOLDER_TYPES } = require('../../../src/models/triage/triageLists')

const FAKE_APPLICATION_LINES = [{
  id: 'FAKE_APPLICATION_LINE_ID_1',
  applicationId: FAKE_APPLICATION_ID,
  itemId: 'ACTIVITY_ITEM_ID_1'
}, {
  id: 'FAKE_APPLICATION_LINE_ID_2',
  applicationId: FAKE_APPLICATION_ID,
  itemId: 'ACTIVITY_ITEM_ID_2'
}, {
  id: 'FAKE_APPLICATION_LINE_ID_3',
  applicationId: FAKE_APPLICATION_ID,
  itemId: 'ASSESSMENT_ITEM_ID_1'
}, {
  id: 'FAKE_APPLICATION_LINE_ID_4',
  applicationId: FAKE_APPLICATION_ID,
  itemId: 'ASSESSMENT_ITEM_ID_2'
}]

let fakeApplicationEntity
let fakeApplicationLineEntities
let applicationEntitySaveStub
let applicationLineEntitySaveStub
let applicationLineEntityDeleteStub
let fakeActivities
let fakeAssessments

lab.experiment('Application Model test:', () => {
  context.applicationId = FAKE_APPLICATION_ID
  let sandbox

  lab.beforeEach(() => {
    fakeActivities = ITEMS.activities.map((item) => Activity.createFromItemEntity(item))
    fakeAssessments = ITEMS.assessments.map((item) => Assessment.createFromItemEntity(item))
    fakeApplicationEntity = new ApplicationEntity({
      id: FAKE_APPLICATION_ID,
      applicantType: DYNAMICS_PERMIT_HOLDER_TYPES.PARTNERSHIP.dynamicsApplicantTypeId,
      organisationType: DYNAMICS_PERMIT_HOLDER_TYPES.PARTNERSHIP.dynamicsOrganisationTypeId
    })
    fakeApplicationLineEntities = FAKE_APPLICATION_LINES.map(item => new ApplicationLineEntity(item))

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub methods
    sandbox.stub(ItemEntity, 'getAllActivitiesAndAssessments').callsFake(async () => ITEMS)
    sandbox.stub(ItemEntity, 'getActivity').callsFake(async (entityContext, activityId) => ITEMS.activities.find(item => item.shortName === activityId))
    sandbox.stub(ItemEntity, 'getAssessment').callsFake(async (entityContext, activityId) => ITEMS.assessments.find(item => item.shortName === activityId))
    sandbox.stub(ApplicationEntity, 'getById').callsFake(async () => fakeApplicationEntity)
    sandbox.stub(ApplicationLineEntity, 'listBy').callsFake(async () => fakeApplicationLineEntities)
    sandbox.stub(ApplicationLineEntity, 'getById').callsFake(async () => fakeApplicationLineEntities[0])
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('Get values:', () => {
    lab.test('getApplicationForId', async () => {
      const application = await ApplicationModel.getApplicationForId(context, fakeApplicationEntity.id)
      Code.expect(application.id).to.equal(fakeApplicationEntity.id)
      Code.expect(application.permitHolderType.id).to.equal(PERMIT_HOLDER_TYPES.PARTNERSHIP.id)
      Code.expect(application.activities.length).to.equal(2)
      Code.expect(application.assessments.length).to.equal(2)
    })

    lab.test('getApplicationForId with invalid permit holder type', async () => {
      fakeApplicationEntity = new ApplicationEntity({
        id: FAKE_APPLICATION_ID,
        applicantType: undefined,
        organisationType: 999999
      })
      const application = await ApplicationModel.getApplicationForId(context, fakeApplicationEntity.id)
      Code.expect(application.id).to.equal(fakeApplicationEntity.id)
      Code.expect(application.permitHolderType).to.not.exist()
    })
  })

  lab.experiment('Set values:', () => {
    lab.test('setPermitHolderType', async () => {
      const application = await ApplicationModel.getApplicationForId(context, fakeApplicationEntity.id)
      Code.expect(application.permitHolderType.id).to.equal(PERMIT_HOLDER_TYPES.PARTNERSHIP.id)
      application.setPermitHolderType(PERMIT_HOLDER_TYPES.INDIVIDUAL)
      Code.expect(application.permitHolderType.id).to.equal(PERMIT_HOLDER_TYPES.INDIVIDUAL.id)
    })

    lab.test('setActivities - add new and remove existing', async () => {
      const application = await ApplicationModel.getApplicationForId(context, fakeApplicationEntity.id)
      application.setActivities([fakeActivities[0], fakeActivities[2]])
      const activities = application.activities
      Code.expect(activities.length).to.equal(3)
      const activitiesToBeDeleted = activities.filter(item => item.toBeDeleted)
      Code.expect(activitiesToBeDeleted.length).to.equal(1)
      const activitiesToBeAdded = activities.filter(item => item.toBeAdded)
      Code.expect(activitiesToBeAdded.length).to.equal(1)
    })

    lab.test('setActivities - remove new', async () => {
      const application = await ApplicationModel.getApplicationForId(context, fakeApplicationEntity.id)
      application.setActivities([fakeActivities[0], fakeActivities[2]])
      application.setActivities([fakeActivities[0]])
      const activities = application.activities
      Code.expect(activities.length).to.equal(2)
      const activitiesToBeDeleted = activities.filter(item => item.toBeDeleted)
      Code.expect(activitiesToBeDeleted.length).to.equal(1)
      const activitiesToBeAdded = activities.filter(item => item.toBeAdded)
      Code.expect(activitiesToBeAdded.length).to.equal(0)
    })

    lab.test('setActivities - re-add existing', async () => {
      const application = await ApplicationModel.getApplicationForId(context, fakeApplicationEntity.id)
      application.setActivities([fakeActivities[0], fakeActivities[2]])
      application.setActivities([fakeActivities[0], fakeActivities[1]])
      const activities = application.activities
      Code.expect(activities.length).to.equal(2)
      const activitiesToBeDeleted = activities.filter(item => item.toBeDeleted)
      Code.expect(activitiesToBeDeleted.length).to.equal(0)
      const activitiesToBeAdded = activities.filter(item => item.toBeAdded)
      Code.expect(activitiesToBeAdded.length).to.equal(0)
    })

    lab.test('setAssessments - add new and remove existing', async () => {
      const application = await ApplicationModel.getApplicationForId(context, fakeApplicationEntity.id)
      application.setAssessments([fakeAssessments[0], fakeAssessments[2]])
      const assessments = application.assessments
      Code.expect(assessments.length).to.equal(3)
      const assessmentsToBeDeleted = assessments.filter(item => item.toBeDeleted)
      Code.expect(assessmentsToBeDeleted.length).to.equal(1)
      const assessmentsToBeAdded = assessments.filter(item => item.toBeAdded)
      Code.expect(assessmentsToBeAdded.length).to.equal(1)
    })

    lab.test('re setAssessments - remove new', async () => {
      const application = await ApplicationModel.getApplicationForId(context, fakeApplicationEntity.id)
      application.setAssessments([fakeAssessments[0], fakeAssessments[2]])
      application.setAssessments([fakeAssessments[0]])
      const assessments = application.assessments
      Code.expect(assessments.length).to.equal(2)
      const assessmentsToBeDeleted = assessments.filter(item => item.toBeDeleted)
      Code.expect(assessmentsToBeDeleted.length).to.equal(1)
      const assessmentsToBeAdded = assessments.filter(item => item.toBeAdded)
      Code.expect(assessmentsToBeAdded.length).to.equal(0)
    })

    lab.test('re setAssessments - re-add existing', async () => {
      const application = await ApplicationModel.getApplicationForId(context, fakeApplicationEntity.id)
      application.setAssessments([fakeAssessments[0], fakeAssessments[2]])
      application.setAssessments([fakeAssessments[0], fakeAssessments[1]])
      const assessments = application.assessments
      Code.expect(assessments.length).to.equal(2)
      const assessmentsToBeDeleted = assessments.filter(item => item.toBeDeleted)
      Code.expect(assessmentsToBeDeleted.length).to.equal(0)
      const assessmentsToBeAdded = assessments.filter(item => item.toBeAdded)
      Code.expect(assessmentsToBeAdded.length).to.equal(0)
    })
  })

  lab.experiment('Save:', () => {
    lab.beforeEach(() => {
      applicationEntitySaveStub = sandbox.stub(ApplicationEntity.prototype, 'save')
      applicationEntitySaveStub.resolves(FAKE_APPLICATION_ID)
      applicationLineEntitySaveStub = sandbox.stub(ApplicationLineEntity.prototype, 'save')
      applicationEntitySaveStub.resolves(null)
      applicationLineEntityDeleteStub = sandbox.stub(ApplicationLineEntity.prototype, 'delete')
      applicationLineEntityDeleteStub.resolves(null)
    })

    lab.test('save a completely blank new application', async () => {
      const application = new ApplicationModel({})
      await application.save(context)
      Code.expect(applicationEntitySaveStub.calledOnce).to.be.true()
      Code.expect(applicationLineEntitySaveStub.notCalled).to.be.true()
    })

    lab.test('save values into a completely blank new application', async () => {
      const application = new ApplicationModel({})
      application.setPermitHolderType(PERMIT_HOLDER_TYPES.INDIVIDUAL)
      application.setActivities([fakeActivities[0], fakeActivities[2]])
      application.setAssessments([fakeAssessments[0], fakeAssessments[2]])
      await application.save(context)
      Code.expect(applicationEntitySaveStub.calledOnce).to.be.true()
      Code.expect(applicationLineEntitySaveStub.callCount).to.equal(4)
    })

    lab.test('save on an empty application', async () => {
      fakeApplicationEntity = new ApplicationEntity({ id: FAKE_APPLICATION_ID })
      fakeApplicationLineEntities = []
      const application = await ApplicationModel.getApplicationForId(context, fakeApplicationEntity.id)
      application.setPermitHolderType(PERMIT_HOLDER_TYPES.INDIVIDUAL)
      application.setActivities([fakeActivities[0], fakeActivities[2]])
      application.setAssessments([fakeAssessments[0], fakeAssessments[2]])
      await application.save(context)
      Code.expect(applicationEntitySaveStub.calledOnce).to.be.true()
      Code.expect(applicationLineEntitySaveStub.callCount).to.equal(4)
    })

    lab.test('save on an empty application with no values set', async () => {
      fakeApplicationEntity = new ApplicationEntity({ id: FAKE_APPLICATION_ID })
      fakeApplicationLineEntities = []
      const application = await ApplicationModel.getApplicationForId(context, fakeApplicationEntity.id)
      await application.save(context)
      Code.expect(applicationEntitySaveStub.calledOnce).to.be.true()
      Code.expect(applicationLineEntitySaveStub.notCalled).to.be.true()
    })

    lab.test('save on an already populated application', async () => {
      const application = await ApplicationModel.getApplicationForId(context, fakeApplicationEntity.id)
      application.setPermitHolderType(PERMIT_HOLDER_TYPES.PUBLIC_BODY)
      application.setActivities([fakeActivities[0], fakeActivities[2]])
      application.setAssessments([fakeAssessments[0], fakeAssessments[2]])
      await application.save(context)
      Code.expect(applicationEntitySaveStub.calledOnce).to.be.true()
      Code.expect(applicationLineEntitySaveStub.callCount).to.equal(2)
      Code.expect(applicationLineEntityDeleteStub.callCount).to.equal(2)
    })
  })
})
