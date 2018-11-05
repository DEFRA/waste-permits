'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Item = require('../../../src/persistence/entities/item.entity')
// const ItemType = require('../../../src/persistence/entities/itemType.entity')
const DynamicsDalService = require('../../../src/services/dynamicsDal.service')

let sandbox
let stub
const entityContext = { authToken: 'AUTH_TOKEN' }

const ACTIVITY_TYPE = {
  id: 'DUMMY-GUID-ACTIVITY-TYPE-00000',
  detailName: 'wasteactivity',
  description: 'Dummy activity type'
}

const ASSESSMENT_TYPE = {
  id: 'DUMMY-GUID-ACTIVITY-TYPE-00000',
  detailName: 'wasteassessment',
  description: 'Dummy assessment type'
}

const fakeItem = (id, itemTypeId) => {
  return {
    id: `DUMMY-GUID-ITEM-${id}`,
    itemName: `Dummy item name ${id}`,
    shortName: `Dummy short name ${id}`,
    itemTypeId: itemTypeId,
    code: `dummy-code-${id}`,
    description: `Dummy description for ${id}`,
    description2: `Dummy description 2 for ${id}`,
    suffix: `1.1.${id}`,
    canApplyFor: true,
    canApplyOnline: true
  }
}

const fakeDynamicsRecord = (id, itemTypeId) => {
  return {
    defra_itemid: `DUMMY-GUID-ITEM-${id}`,
    defra_name: `Dummy item name ${id}`,
    defra_shortname: `Dummy short name ${id}`,
    _defra_itemtypeid_value: itemTypeId,
    defra_code: `dummy-code-${id}`,
    defra_description: `Dummy description for ${id}`,
    defra_description2: `Dummy description 2 for ${id}`,
    defra_suffix: `1.1.${id}`,
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
      const itemDetail = new Item(fakeItem('FAKE', ACTIVITY_TYPE.id))
      await itemDetail.save()
    } catch (err) {
      error = err
    }
    Code.expect(error.message).to.equal('Unable to save defra_items: Read only!')
  })

  lab.test('listAssessments() returns correct values', async () => {
    stub.callsFake(async () => {
      return { value: [fakeDynamicsRecord('00001', ASSESSMENT_TYPE.id)] }
    })
    const expectedItems = [fakeItem('00001', ASSESSMENT_TYPE.id)]
    const items = await Item.listAssessments(entityContext, 'DUMMY')
    Code.expect(items).to.exist()
    Code.expect(items).to.equal(expectedItems)
  })
})
