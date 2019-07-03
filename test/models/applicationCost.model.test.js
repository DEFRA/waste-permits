'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const ApplicationCostModel = require('../../src/models/applicationCost.model')
const ItemEntity = require('../../src/persistence/entities/item.entity')
const ApplicationEntity = require('../../src/persistence/entities/application.entity')
const ApplicationLineEntity = require('../../src/persistence/entities/applicationLine.entity')

const context = { }
const ACTIVITY_ITEM_TYPE_ID = 'ACTIVITY_ITEM_TYPE_ID'
const ASSESSMENT_ITEM_TYPE_ID = 'ASSESSMENT_ITEM_TYPE_ID'

const { PERMIT_HOLDER_TYPES: DYNAMICS_PERMIT_HOLDER_TYPES } = require('../../src/dynamics')

const ITEMS = {
  wasteActivities: [{
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
  wasteAssessments: [{
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

const FAKE_APPLICATION_LINES = [{
  id: 'FAKE_APPLICATION_LINE_ID_1',
  applicationId: FAKE_APPLICATION_ID,
  itemId: 'ACTIVITY_ITEM_ID_1',
  value: 1000.01
}, {
  id: 'FAKE_APPLICATION_LINE_ID_2',
  applicationId: FAKE_APPLICATION_ID,
  itemId: 'ACTIVITY_ITEM_ID_2',
  value: 2000.01
}, {
  id: 'FAKE_APPLICATION_LINE_ID_3',
  applicationId: FAKE_APPLICATION_ID,
  itemId: 'ASSESSMENT_ITEM_ID_1',
  value: 100.01
}, {
  id: 'FAKE_APPLICATION_LINE_ID_4',
  applicationId: FAKE_APPLICATION_ID,
  itemId: 'ASSESSMENT_ITEM_ID_2',
  value: 200.01
}, {
  id: 'FAKE_APPLICATION_LINE_ID_5',
  applicationId: FAKE_APPLICATION_ID,
  itemId: 'ACTIVITY_ITEM_ID_3'
}, {
  id: 'FAKE_APPLICATION_LINE_ID_6',
  applicationId: FAKE_APPLICATION_ID,
  itemId: 'ASSESSMENT_ITEM_ID_3',
  value: 0
}]
const TOTAL_COST = 3300.04
const COST_TEXT = ['£1,000.01', '£2,000.01', undefined, '£100.01', '£200.01', 'Cost included in application']

let fakeApplicationEntity
let fakeApplicationLineEntities

lab.experiment('Application Cost Model test:', () => {
  let sandbox

  lab.beforeEach(() => {
    fakeApplicationEntity = new ApplicationEntity({
      id: FAKE_APPLICATION_ID,
      applicantType: DYNAMICS_PERMIT_HOLDER_TYPES.PARTNERSHIP.dynamicsApplicantTypeId,
      organisationType: DYNAMICS_PERMIT_HOLDER_TYPES.PARTNERSHIP.dynamicsOrganisationTypeId,
      lineItemsTotalAmount: TOTAL_COST
    })
    fakeApplicationLineEntities = FAKE_APPLICATION_LINES.map(item => new ApplicationLineEntity(item))

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub methods
    sandbox.stub(ItemEntity, 'getAllWasteActivitiesAndAssessments').callsFake(async () => ITEMS)
    sandbox.stub(ItemEntity, 'getWasteActivity').callsFake(async (entityContext, activityId) => ITEMS.find(item => item.shortName === activityId))
    sandbox.stub(ItemEntity, 'getWasteAssessment').callsFake(async (entityContext, activityId) => ITEMS.find(item => item.shortName === activityId))
    sandbox.stub(ApplicationEntity, 'getById').callsFake(async () => fakeApplicationEntity)
    sandbox.stub(ApplicationLineEntity, 'listBy').callsFake(async () => fakeApplicationLineEntities)
    sandbox.stub(ApplicationLineEntity, 'getById').callsFake(async () => fakeApplicationLineEntities[0])
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('Get values:', () => {
    lab.test('getApplicationCostForApplicationId', async () => {
      const applicationCost = await ApplicationCostModel.getApplicationCostForApplicationId(context, fakeApplicationEntity.id)
      Code.expect(applicationCost.items.length).to.equal(6)
    })
    lab.test('correct costs', async () => {
      const applicationCost = await ApplicationCostModel.getApplicationCostForApplicationId(context, fakeApplicationEntity.id)
      Code.expect(applicationCost.total.cost).to.equal(TOTAL_COST)
      const summedItemCost = applicationCost.items.reduce((acc, { costValue }) => acc + costValue, 0)
      Code.expect(summedItemCost).to.equal(TOTAL_COST)
    })
    lab.test('correct cost text in order', async () => {
      const applicationCost = await ApplicationCostModel.getApplicationCostForApplicationId(context, fakeApplicationEntity.id)
      const allCostText = applicationCost.items.map(({ costText }) => costText)
      Code.expect(allCostText).to.equal(COST_TEXT)
    })
  })
})
