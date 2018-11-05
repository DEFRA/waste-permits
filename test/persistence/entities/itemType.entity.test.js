'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const ItemDetailType = require('../../../src/persistence/entities/itemType.entity')
const DynamicsDalService = require('../../../src/services/dynamicsDal.service')

let sandbox
let stub
const entityContext = { authToken: 'AUTH_TOKEN' }

const fakeItemType = (id) => {
  return {
    id: `DUMMY-GUID-ITEM-TYPE-${id}`,
    itemTypeName: `Dummy item type ${id}`,
    shortName: `dummy-item-type-${id}`
  }
}

const fakeDynamicsRecord = (id) => {
  return {
    defra_itemtypeid: `DUMMY-GUID-ITEM-TYPE-${id}`,
    defra_name: `Dummy item type ${id}`,
    defra_shortname: `dummy-item-type-${id}`
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
      const itemDetailType = new ItemDetailType(fakeItemType('FAKE'))
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
    const expectedItemDetailType = fakeItemType('00001')
    const itemDetailType = await ItemDetailType.getByShortName(entityContext)
    Code.expect(itemDetailType).to.exist()
    Code.expect(itemDetailType).to.equal(expectedItemDetailType)
  })
})
