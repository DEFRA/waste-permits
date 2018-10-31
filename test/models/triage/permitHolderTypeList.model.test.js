'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const PermitHolderTypeList = require('../../../src/models/triage/permitHolderTypeList.model')

const BESPOKE = [{
  id: 'bespoke',
  canApplyOnline: true
}]
const SR = [{
  id: 'standard-rules',
  canApplyOnline: true
}]

const INVALID_PERMIT_HOLDER_TYPE = 'invalid-permit-holder-type'
const LTD_CO = 'limited-company'
const OTHER = 'other-organisation'
const NUMBER_OF_FACILITY_TYPES = 5

let permitHolderTypeList

lab.beforeEach(async () => {
  permitHolderTypeList = await PermitHolderTypeList.createList({}, BESPOKE)
})

lab.experiment('Triage permit holder type model tests:', () => {
  lab.test('includes limited companies and other organisations', async () => {
    Code.expect(permitHolderTypeList.ids).to.include([LTD_CO, OTHER])
  })

  lab.experiment('Select:', () => {
    lab.test('can select limited company', async () => {
      const ltdCoList = permitHolderTypeList.getListFilteredByIds([LTD_CO])
      Code.expect(ltdCoList.items.length).to.equal(1)
      const ltdCoItem = ltdCoList.entry(LTD_CO)
      Code.expect(ltdCoItem).to.exist()
      Code.expect(ltdCoItem.id).to.equal(LTD_CO)
      Code.expect(ltdCoItem.text).to.exist()
      Code.expect(ltdCoItem.text).to.not.be.empty()
    })
    lab.test('can select other organisation', async () => {
      const otherList = permitHolderTypeList.getListFilteredByIds([OTHER])
      Code.expect(otherList.items.length).to.equal(1)
      const otherItem = otherList.entry(OTHER)
      Code.expect(otherItem).to.exist()
      Code.expect(otherItem.id).to.equal(OTHER)
      Code.expect(otherItem.text).to.exist()
      Code.expect(otherItem.text).to.not.be.empty()
    })
    lab.test('cannot select invalid permit holder type', async () => {
      const invalidList = permitHolderTypeList.getListFilteredByIds([INVALID_PERMIT_HOLDER_TYPE])
      Code.expect(invalidList.items.length).to.equal(0)
      const invalidItem = invalidList.entry(INVALID_PERMIT_HOLDER_TYPE)
      Code.expect(invalidItem).to.not.exist()
    })
  })

  lab.experiment('Available online:', () => {
    lab.test('cannot all be applied for online', async () => {
      Code.expect(permitHolderTypeList.canApplyOnline).to.be.false()
    })
    lab.test('limited company can be applied for online', async () => {
      const ltdCoList = permitHolderTypeList.getListFilteredByIds([LTD_CO])
      Code.expect(ltdCoList.canApplyOnline).to.be.true()
    })
    lab.test('other organisation cannot be applied for online', async () => {
      const otherList = permitHolderTypeList.getListFilteredByIds([OTHER])
      Code.expect(otherList.canApplyOnline).to.be.false()
    })
    lab.test('invalid or missing permit holder type cannot be applied for online', async () => {
      const invalidList = permitHolderTypeList.getListFilteredByIds([INVALID_PERMIT_HOLDER_TYPE])
      Code.expect(invalidList.canApplyOnline).to.be.false()
    })
  })

  lab.experiment('Provide correct facility types:', () => {
    lab.test('full list for bespoke', async () => {
      const filteredPermitHolderTypeList = permitHolderTypeList.getListFilteredByIds([LTD_CO])
      const facilityTypeList = await filteredPermitHolderTypeList.getFacilityTypeList()
      Code.expect(facilityTypeList.items.length).to.equal(NUMBER_OF_FACILITY_TYPES)
    })
    lab.test('none for standard rules', async () => {
      const bespokePermitHolderTypeList = await PermitHolderTypeList.createList({}, SR)
      const filteredPermitHolderTypeList = bespokePermitHolderTypeList.getListFilteredByIds([LTD_CO])
      const facilityTypeList = await filteredPermitHolderTypeList.getFacilityTypeList()
      Code.expect(facilityTypeList.items.length).to.equal(0)
    })
  })
})
