'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const PermitTypeList = require('../../../src/models/triage/permitTypeList.model')

const BESPOKE = 'bespoke'
const SR = 'standard-rules'
const INVALID_PERMIT_TYPE = 'invalid-permit-type'
const NUMBER_OF_PERMIT_HOLDER_TYPES = 8

let permitTypeList

lab.beforeEach(async () => {
  permitTypeList = await PermitTypeList.getListOfAllPermitTypes({})
})

lab.experiment('Triage permit type model tests:', () => {
  lab.test('only includes bespoke and standard rules', async () => {
    Code.expect(permitTypeList.ids).to.only.include([BESPOKE, SR])
  })

  lab.experiment('Select:', () => {
    lab.test('can select bespoke', async () => {
      const bespokeList = permitTypeList.getListFilteredByIds([BESPOKE])
      Code.expect(bespokeList.items.length).to.equal(1)
      const bespokeItem = bespokeList.entry(BESPOKE)
      Code.expect(bespokeItem).to.exist()
      Code.expect(bespokeItem.id).to.equal(BESPOKE)
      Code.expect(bespokeItem.text).to.exist()
      Code.expect(bespokeItem.text).to.not.be.empty()
    })
    lab.test('can select standard rules', async () => {
      const srList = permitTypeList.getListFilteredByIds([SR])
      Code.expect(srList.items.length).to.equal(1)
      const srItem = srList.entry(SR)
      Code.expect(srItem).to.exist()
      Code.expect(srItem.id).to.equal(SR)
      Code.expect(srItem.text).to.exist()
      Code.expect(srItem.text).to.not.be.empty()
    })
    lab.test('cannot select invalid permit type', async () => {
      const invalidList = permitTypeList.getListFilteredByIds([INVALID_PERMIT_TYPE])
      Code.expect(invalidList.items.length).to.equal(0)
      const invalidItem = invalidList.entry(INVALID_PERMIT_TYPE)
      Code.expect(invalidItem).to.not.exist()
    })
  })

  lab.experiment('Available online:', () => {
    lab.test('can all be applied for online', async () => {
      Code.expect(permitTypeList.canApplyOnline).to.be.true()
    })
    lab.test('invalid or missing permit type cannot be applied for online', async () => {
      const invalidList = permitTypeList.getListFilteredByIds([INVALID_PERMIT_TYPE])
      Code.expect(invalidList.canApplyOnline).to.be.false()
    })
  })

  lab.experiment('Provide a full list of permit holder types:', () => {
    lab.test('for bespoke', async () => {
      const filteredList = permitTypeList.getListFilteredByIds([BESPOKE])
      const permitHolderTypeList = await filteredList.getPermitHolderTypeList()
      Code.expect(permitHolderTypeList.items.length).to.equal(NUMBER_OF_PERMIT_HOLDER_TYPES)
    })
    lab.test('for standard rules', async () => {
      const filteredList = permitTypeList.getListFilteredByIds([SR])
      const permitHolderTypeList = await filteredList.getPermitHolderTypeList()
      Code.expect(permitHolderTypeList.items.length).to.equal(NUMBER_OF_PERMIT_HOLDER_TYPES)
    })
  })
})
