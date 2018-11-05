'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const ItemType = require('../../../src/persistence/entities/itemType.entity')
const DynamicsDalService = require('../../../src/services/dynamicsDal.service')

let sandbox
let stub
const entityContext = { authToken: 'AUTH_TOKEN' }

const fakeItemType = (id) => {
  return {
    id: `DUMMY-GUID-ITEM-TYPE-${id}`,
    itemTypeName: `Dummy item type ${id}`,
    shortName: id
  }
}

const fakeDynamicsRecord = (id) => {
  return {
    defra_itemtypeid: `DUMMY-GUID-ITEM-TYPE-${id}`,
    defra_name: `Dummy item type ${id}`,
    defra_shortname: id
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

lab.experiment('ItemType Entity tests:', () => {
  lab.test('save() method should fail as this entity is readOnly', async () => {
    let error
    try {
      const itemDetailType = new ItemType(fakeItemType('FAKE'))
      await itemDetailType.save()
    } catch (err) {
      error = err
    }
    Code.expect(error.message).to.equal('Unable to save defra_itemtypes: Read only!')
  })

  lab.test('getByShortName() returns correct values', async () => {
    stub.callsFake(async () => {
      return { value: [fakeDynamicsRecord('00001')] }
    })
    const expectedItemType = fakeItemType('00001')
    const itemType = await ItemType.getByShortName(entityContext)
    Code.expect(itemType).to.exist()
    Code.expect(itemType).to.equal(expectedItemType)
  })

  lab.test('listByShortName() returns correct values', async () => {
    stub.callsFake(async () => {
      return { value: [fakeDynamicsRecord('00001'), fakeDynamicsRecord('00002')] }
    })
    const expectedItemTypes = [fakeItemType('00001'), fakeItemType('00002')]
    const itemTypes = await ItemType.listByShortName(entityContext)
    Code.expect(itemTypes.length).to.equal(expectedItemTypes.length)
  })

  lab.test('getActivityAndAssessmentItemTypes() returns correct values', async () => {
    const fakeDynamicsRecords = { value: [fakeDynamicsRecord('wasteactivity'), fakeDynamicsRecord('wasteassessment')] }
    stub.callsFake(async () => fakeDynamicsRecords)
    const expectedItemTypes = {
      activity: fakeItemType('wasteactivity'),
      assessment: fakeItemType('wasteassessment')
    }
    const itemTypes = await ItemType.getActivityAndAssessmentItemTypes(entityContext)
    Code.expect(itemTypes).to.equal(expectedItemTypes)
  })
})
