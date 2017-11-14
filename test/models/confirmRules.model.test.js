'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const ConfirmRules = require('../../src/models/confirmRules.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let dynamicsSearchStub
let dynamicsUpdateStub

let testConfirmRules
const fakeConfirmRulesDynamicsData = {
  defra_parametersId: {
    '@odata.etag': '"W/"862776""',
    defra_confirmreadrules_completed: false,
    defra_wasteparamsid: '13fd8e58-9bc4-e711-811c-5065f38ac931'
  }
}
const fakeConfirmRulesData = {
  complete: false,
  applicationId: 'APPLICATION_ID',
  applicationLineId: 'APPLICATION_LINE_ID'
}
let savedConfirmRulesData = {}

lab.beforeEach(() => {
  testConfirmRules = new ConfirmRules(fakeConfirmRulesData)
  testConfirmRules.delay = 0

  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = () => {
    // Dynamics ConfirmRules object
    return fakeConfirmRulesDynamicsData
  }

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = (query, entity) => {
    savedConfirmRulesData = {
      defra_parametersId: Object.assign({}, fakeConfirmRulesDynamicsData.defra_parametersId, entity)
    }
  }
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.search = dynamicsSearchStub
  DynamicsDalService.prototype.update = dynamicsUpdateStub
})

lab.experiment('ConfirmRules Model tests:', () => {
  lab.test('Constructor creates a ConfirmRules object correctly', () => {
    const emptyConfirmRules = new ConfirmRules({})
    Code.expect(emptyConfirmRules.complete).to.be.undefined()

    Code.expect(testConfirmRules.complete).to.equal(fakeConfirmRulesData.complete)
    Code.expect(testConfirmRules.applicationId).to.equal(fakeConfirmRulesData.applicationId)
    Code.expect(testConfirmRules.applicationLineId).to.equal(fakeConfirmRulesData.applicationLineId)
  })

  lab.test('getByApplicationId() method returns a single ConfirmRules object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const confirmRules = await ConfirmRules.getByApplicationId()
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(confirmRules.complete).to.equal(fakeConfirmRulesData.complete)
  })

  lab.test('save() method updates an existing ConfirmRules object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    await testConfirmRules.save()
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(savedConfirmRulesData.defra_parametersId.defra_confirmreadrules_completed).to.equal(true)
  })
})
