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

  // Clear the cache
  Item.clearCache()
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

  lab.test('listWasteAssessments() returns correct values', async () => {
    stub.callsFake(async () => {
      return { value: [fakeDynamicsRecord('test-1')] }
    })
    const expectedItems = [fakeItem('test-1')]
    const items = await Item.listWasteAssessments(entityContext)
    Code.expect(items).to.exist()
    Code.expect(items).to.equal(expectedItems)
  })

  lab.test('getAllWasteActivitiesAndAssessments() returns correct values', async () => {
    stub.onFirstCall().resolves({ value: [fakeDynamicsRecord('test-2-activities')] })
    stub.onSecondCall().resolves({ value: [fakeDynamicsRecord('test-2-assessments')] })
    const expectedItems = { wasteActivities: [fakeItem('test-2-activities')], wasteAssessments: [fakeItem('test-2-assessments')] }
    const items = await Item.getAllWasteActivitiesAndAssessments(entityContext)
    Code.expect(items).to.exist()
    Code.expect(items).to.equal(expectedItems)
  })

  lab.test('getWasteActivity() returns correct values', async () => {
    stub.callsFake(async () => {
      return { value: [fakeDynamicsRecord('test-3')] }
    })
    const expectedItem = fakeItem('test-3')
    const item = await Item.getWasteActivity(entityContext, expectedItem.shortName)
    Code.expect(item).to.exist()
    Code.expect(item).to.equal(expectedItem)
  })

  lab.test('getWasteAssessment() returns correct values', async () => {
    stub.callsFake(async () => {
      return { value: [fakeDynamicsRecord('test-4')] }
    })
    const expectedItem = fakeItem('test-4')
    const item = await Item.getWasteAssessment(entityContext, expectedItem.shortName)
    Code.expect(item).to.exist()
    Code.expect(item).to.equal(expectedItem)
  })

  lab.test('listWasteActivitiesForFacilityTypes() returns correct values', async () => {
    stub.callsFake(async () => {
      return { value: [fakeDynamicsRecord('test-5')] }
    })
    const expectedItems = [fakeItem('test-5')]
    const items = await Item.listWasteActivitiesForFacilityTypes(entityContext, ['DUMMY'])
    Code.expect(items).to.equal(expectedItems)
  })

  // TODO: MCP - Add tests for getAllMcpTypes

  lab.test('getMcpType() returns correct values', async () => {
    stub.callsFake(async () => {
      return { value: [fakeDynamicsRecord('test-6')] }
    })
    const expectedItem = fakeItem('test-6')
    const item = await Item.getMcpType(entityContext, expectedItem.shortName)
    Code.expect(item).to.exist()
    Code.expect(item).to.equal(expectedItem)
  })

  lab.test('getMcpAssessment() returns correct values', async () => {
    stub.callsFake(async () => {
      return { value: [fakeDynamicsRecord('test-7')] }
    })
    const expectedItem = fakeItem('test-7')
    const item = await Item.getMcpAssessment(entityContext, expectedItem.shortName)
    Code.expect(item).to.exist()
    Code.expect(item).to.equal(expectedItem)
  })

  lab.test('listMcpTypesForFacilityTypes() returns correct values', async () => {
    stub.callsFake(async () => {
      return { value: [fakeDynamicsRecord('test-9')] }
    })
    const expectedItems = [fakeItem('test-9')]
    const items = await Item.listMcpTypesForFacilityTypes(entityContext, ['DUMMY'])
    Code.expect(items).to.equal(expectedItems)
  })
})
