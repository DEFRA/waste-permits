'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Item = require('../../../src/persistence/entities/item.entity')
const DynamicsDalService = require('../../../src/services/dynamicsDal.service')

let sandbox
let stub
const entityContext = { authToken: 'AUTH_TOKEN' }

const ACTIVITY_TYPE = {
  id: 'DUMMY-GUID-ACTIVITY-TYPE-00000',
  itemTypeName: 'Waste activity',
  shortName: 'wasteactivity'
}

const fakeItem = (id) => {
  return {
    id: `DUMMY-GUID-ITEM-${id}`,
    itemName: `Dummy item name ${id}`,
    shortName: `dummy-short-name-${id}`,
    code: `dummy-code-${id}`,
    canApplyFor: true,
    canApplyOnline: true
  }
}

const fakeDynamicsRecord = (id) => {
  return {
    defra_itemid: `DUMMY-GUID-ITEM-${id}`,
    defra_name: `Dummy item name ${id}`,
    defra_shortname: `dummy-short-name-${id}`,
    defra_code: `dummy-code-${id}`,
    defra_canapplyfor: true,
    defra_canapplyonline: true
  }
}

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  stub = sandbox.stub(DynamicsDalService.prototype, 'search')
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Item Entity tests:', () => {
  lab.test('save() method should fail as this entity is readOnly', async () => {
    let error
    try {
      const item = new Item(fakeItem('FAKE', ACTIVITY_TYPE.id))
      await item.save()
    } catch (err) {
      error = err
    }
    Code.expect(error.message).to.equal('Unable to save defra_items: Read only!')
  })

  lab.test('listAssessments() returns correct values', async () => {
    stub.callsFake(async () => {
      return { value: [fakeDynamicsRecord('00001')] }
    })
    const expectedItems = [fakeItem('00001')]
    const items = await Item.listAssessments(entityContext)
    Code.expect(items).to.exist()
    Code.expect(items).to.equal(expectedItems)
  })

  lab.test('getAllActivitiesAndAssessments() returns correct values', async () => {
    stub.onFirstCall().resolves({ value: [fakeDynamicsRecord('00001')] })
    stub.onSecondCall().resolves({ value: [fakeDynamicsRecord('00002')] })
    const expectedItems = { activities: [fakeItem('00001')], assessments: [fakeItem('00002')] }
    const items = await Item.getAllActivitiesAndAssessments(entityContext)
    Code.expect(items).to.exist()
    Code.expect(items).to.equal(expectedItems)
  })

  lab.test('getActivity() returns correct values', async () => {
    stub.callsFake(async () => {
      return { value: [fakeDynamicsRecord('00001')] }
    })
    const expectedItem = fakeItem('00001')
    const item = await Item.getActivity(entityContext, expectedItem.shortName)
    Code.expect(item).to.exist()
    Code.expect(item).to.equal(expectedItem)
  })

  lab.test('getAssessment() returns correct values', async () => {
    stub.callsFake(async () => {
      return { value: [fakeDynamicsRecord('00001')] }
    })
    const expectedItem = fakeItem('00001')
    const item = await Item.getAssessment(entityContext, expectedItem.shortName)
    Code.expect(item).to.exist()
    Code.expect(item).to.equal(expectedItem)
  })

  lab.test('listActivitiesForFacilityTypes() returns correct values', async () => {
    stub.callsFake(async () => {
      return { value: [fakeDynamicsRecord('00001')] }
    })
    const expectedItems = [fakeItem('00001')]
    const items = await Item.listActivitiesForFacilityTypes(entityContext, ['DUMMY'])
    Code.expect(items).to.equal(expectedItems)
  })
})
