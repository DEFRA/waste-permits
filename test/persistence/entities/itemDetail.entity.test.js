'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const ItemDetail = require('../../../src/persistence/entities/itemDetail.entity')
const ItemDetailType = require('../../../src/persistence/entities/itemDetailType.entity')
const DynamicsDalService = require('../../../src/services/dynamicsDal.service')

let sandbox
let stub
const entityContext = { authToken: 'AUTH_TOKEN' }

const FACILITY_TYPE = {
  id: 'DUMMY-GUID-FACILITY-TYPE-00000',
  detailName: 'facilitytype',
  description: 'Dummy facility type'
}

const fakeItemDetail = (id) => {
  return {
    id: `DUMMY-GUID-ITEM-DETAIL-${id}`,
    itemId: `DUMMY-GUID-ITEM-${id}`,
    itemDetailTypeId: FACILITY_TYPE.id,
    value: `dummy-item-detail-${id}`
  }
}

const fakeDynamicsRecord = (id) => {
  return {
    defra_itemdetailid: `DUMMY-GUID-ITEM-DETAIL-${id}`,
    _defra_itemid_value: `DUMMY-GUID-ITEM-${id}`,
    _defra_itemdetailtypeid_value: FACILITY_TYPE.id,
    defra_value: `dummy-item-detail-${id}`
  }
}

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(ItemDetailType, 'getByName').callsFake(async () => {
    return FACILITY_TYPE
  })
  stub = sandbox.stub(DynamicsDalService.prototype, 'search')
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('ItemDetail Entity tests:', () => {
  lab.test('save() method should fail as this entity is readOnly', async () => {
    let error
    try {
      const itemDetail = new ItemDetail(fakeItemDetail('FAKE'))
      await itemDetail.save()
    } catch (err) {
      error = err
    }
    Code.expect(error.message).to.equal('Unable to save defra_itemdetails: Read only!')
  })

  lab.test('listActivitiesForFacilityType() returns correct values', async () => {
    stub.callsFake(async () => {
      return { value: [fakeDynamicsRecord('00001')] }
    })
    const expectedItemDetail = [fakeItemDetail('00001')]
    const itemDetail = await ItemDetail.listActivitiesForFacilityType(entityContext, 'DUMMY')
    Code.expect(itemDetail).to.exist()
    Code.expect(itemDetail).to.equal(expectedItemDetail)
  })
})
