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

const fakeItem = (id) => {
  return {
    id: `DUMMY-GUID-ITEM-${id}`,
    itemName: `Dummy item name ${id}`,
    displayName: `Dummy item display name ${id}`,
    itemTypeId: ACTIVITY_TYPE.id,
    code: `dummy-code-${id}`,
    description: `Dummy description for ${id}`,
    description2: `Dummy description 2 for ${id}`,
    suffix: `1.1.${id}`,
    canApplyOnline: true
  }
}

const fakeDynamicsRecord = (id) => {
  return {
    defra_itemid: `DUMMY-GUID-ITEM-${id}`,
    defra_name: `Dummy item name ${id}`,
    defra_displayname: `Dummy item display name ${id}`,
    _defra_itemtypeid_value: ACTIVITY_TYPE.id,
    defra_code: `dummy-code-${id}`,
    defra_description: `Dummy description for ${id}`,
    defra_description2: `Dummy description 2 for ${id}`,
    defra_suffix: `1.1.${id}`,
    defra_canapplyonline: true
  }
}

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  // sandbox.stub(ItemDetailType, 'getByName').callsFake(async () => {
  //   return FACILITY_TYPE
  // })
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
      const itemDetail = new Item(fakeItem('FAKE'))
      await itemDetail.save()
    } catch (err) {
      error = err
    }
    Code.expect(error.message).to.equal('Unable to save defra_items: Read only!')
  })

  lab.test('getBy() id returns correct values', async () => {
    stub.callsFake(async () => {
      return { value: [fakeDynamicsRecord('00001')] }
    })
    const expectedItem = fakeItem('00001')
    const item = await Item.getBy(entityContext, { id: 'DUMMY' })
    Code.expect(item).to.exist()
    Code.expect(item).to.equal(expectedItem)
  })
})
