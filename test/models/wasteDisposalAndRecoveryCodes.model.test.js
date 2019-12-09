'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const WasteDisposalAndRecoveryCodes = require('../../src/models/wasteDisposalAndRecoveryCodes.model')
const DataStore = require('../../src/models/dataStore.model')
const ApplicationLine = require('../../src/persistence/entities/applicationLine.entity')
const Item = require('../../src/persistence/entities/item.entity')
const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')

lab.experiment('WasteDisposalAndRecoveryCodes test:', () => {
  let sandbox
  let listStub
  let getStub
  let saveSpy
  let saveAnswerSpy

  lab.beforeEach(() => {
    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub methods
    listStub = sandbox.stub(ApplicationLine, 'listForWasteActivities')
    listStub.resolves([
      { id: 'a', value: 100 },
      { id: 'b', lineName: 'Line B', value: 100 },
      { id: 'c', lineName: 'Line C', value: 100 }
    ])
    getStub = sandbox.stub(DataStore, 'get')
    getStub.resolves(new DataStore({ data: {} }))
    saveSpy = sandbox.stub(DataStore.prototype, 'save')
    saveSpy.resolves()
    saveAnswerSpy = sandbox.stub(ApplicationAnswer.prototype, 'save')
    saveAnswerSpy.resolves()
    sandbox.stub(Item, 'getById').resolves({ itemName: 'Dummy item name' })
    sandbox.stub(Item, 'listBy').resolves([{ itemName: 'Dummy item name' }])
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('getForActivity', () => {
    lab.test('returns empty when not entered', async () => {
      const wasteDisposalAndRecoveryCodes = await WasteDisposalAndRecoveryCodes.getForActivity(undefined, 0)
      Code.expect(wasteDisposalAndRecoveryCodes).to.exist()
      Code.expect(wasteDisposalAndRecoveryCodes.selectedWasteDisposalCodes.length).to.equal(0)
      Code.expect(wasteDisposalAndRecoveryCodes.selectedWasteRecoveryCodes.length).to.equal(0)
    })
    lab.test('returns content when entered', async () => {
      const applicationWasteDisposalAndRecoveryCodes = {
        'b': {
          selectedWasteDisposalCodes: ['d01', 'd02'],
          selectedWasteRecoveryCodes: ['r01', 'r02']
        }
      }
      getStub.resolves(new DataStore({ data: { applicationWasteDisposalAndRecoveryCodes } }))
      const wasteDisposalAndRecoveryCodes = await WasteDisposalAndRecoveryCodes.getForActivity(undefined, 1)
      Code.expect(wasteDisposalAndRecoveryCodes).to.exist()
      Code.expect(wasteDisposalAndRecoveryCodes.selectedWasteDisposalCodes.length).to.equal(2)
      Code.expect(wasteDisposalAndRecoveryCodes.selectedWasteRecoveryCodes.length).to.equal(2)
    })
    lab.test('returns nothing when invalid activity', async () => {
      const wasteDisposalAndRecoveryCodes = await WasteDisposalAndRecoveryCodes.getForActivity(undefined, 99)
      Code.expect(wasteDisposalAndRecoveryCodes).to.not.exist()
    })
  })

  lab.experiment('getAllForApplication', () => {
    lab.test('returns empty when not entered', async () => {
      const allWasteDisposalAndRecoveryCodes = await WasteDisposalAndRecoveryCodes.getAllForApplication(undefined, 0)
      Code.expect(allWasteDisposalAndRecoveryCodes).to.exist()
      const wasteDisposalAndRecoveryCodes = allWasteDisposalAndRecoveryCodes[0]
      Code.expect(wasteDisposalAndRecoveryCodes).to.exist()
      Code.expect(wasteDisposalAndRecoveryCodes.selectedWasteDisposalCodes.length).to.equal(0)
      Code.expect(wasteDisposalAndRecoveryCodes.selectedWasteRecoveryCodes.length).to.equal(0)
    })
    lab.test('returns content when entered', async () => {
      const applicationWasteDisposalAndRecoveryCodes = {
        'b': {
          selectedWasteDisposalCodes: ['d01', 'd02'],
          selectedWasteRecoveryCodes: ['r01', 'r02']
        }
      }
      getStub.resolves(new DataStore({ data: { applicationWasteDisposalAndRecoveryCodes } }))
      const allWasteDisposalAndRecoveryCodes = await WasteDisposalAndRecoveryCodes.getAllForApplication(undefined, 0)
      Code.expect(allWasteDisposalAndRecoveryCodes).to.exist()
      const wasteDisposalAndRecoveryCodes = allWasteDisposalAndRecoveryCodes[1]
      Code.expect(wasteDisposalAndRecoveryCodes).to.exist()
      Code.expect(wasteDisposalAndRecoveryCodes.selectedWasteDisposalCodes.length).to.equal(2)
      Code.expect(wasteDisposalAndRecoveryCodes.selectedWasteRecoveryCodes.length).to.equal(2)
    })
    lab.test('returns empty when no lines', async () => {
      listStub.resolves(undefined)
      const allWasteDisposalAndRecoveryCodes = await WasteDisposalAndRecoveryCodes.getAllForApplication(undefined, 0)
      Code.expect(allWasteDisposalAndRecoveryCodes).to.exist()
      Code.expect(allWasteDisposalAndRecoveryCodes.length).to.equal(0)
    })
  })

  lab.test('save', async () => {
    const wasteDisposalAndRecoveryCodes = new WasteDisposalAndRecoveryCodes()
    await wasteDisposalAndRecoveryCodes.save()
    Code.expect(saveSpy.callCount).to.equal(1)
    Code.expect(saveAnswerSpy.callCount).to.equal(2)
  })

  lab.test('wasteDisposalCodeList', async () => {
    const applicationWasteDisposalAndRecoveryCodes = { 'a': { selectedWasteDisposalCodes: ['d01'] } }
    getStub.resolves(new DataStore({ data: { applicationWasteDisposalAndRecoveryCodes } }))
    const wasteDisposalAndRecoveryCodes = await WasteDisposalAndRecoveryCodes.getForActivity(undefined, 0)
    const wasteDisposalCodeList = wasteDisposalAndRecoveryCodes.wasteDisposalCodeList
    Code.expect(wasteDisposalCodeList.length).to.equal(15)
    Code.expect(wasteDisposalCodeList[0].selected).to.be.true()
    Code.expect(wasteDisposalCodeList[1].selected).to.be.false()
  })

  lab.test('wasteRecoveryCodeList', async () => {
    const applicationWasteDisposalAndRecoveryCodes = { 'a': { selectedWasteRecoveryCodes: ['r01'] } }
    getStub.resolves(new DataStore({ data: { applicationWasteDisposalAndRecoveryCodes } }))
    const wasteDisposalAndRecoveryCodes = await WasteDisposalAndRecoveryCodes.getForActivity(undefined, 0)
    const wasteRecoveryCodeList = wasteDisposalAndRecoveryCodes.wasteRecoveryCodeList
    Code.expect(wasteRecoveryCodeList.length).to.equal(13)
    Code.expect(wasteRecoveryCodeList[0].selected).to.be.true()
    Code.expect(wasteRecoveryCodeList[1].selected).to.be.false()
  })

  lab.test('get combinedSelectedCodesForDisplay', async () => {
    const applicationWasteDisposalAndRecoveryCodes = {
      'b': {
        selectedWasteDisposalCodes: ['d01', 'd02'],
        selectedWasteRecoveryCodes: ['r01', 'r02']
      }
    }
    getStub.resolves(new DataStore({ data: { applicationWasteDisposalAndRecoveryCodes } }))
    const wasteDisposalAndRecoveryCodes = await WasteDisposalAndRecoveryCodes.getForActivity(undefined, 1)
    Code.expect(wasteDisposalAndRecoveryCodes).to.exist()
    Code.expect(wasteDisposalAndRecoveryCodes.combinedSelectedCodesForDisplay).to.equal(['D1', 'D2', 'R1', 'R2'])
  })

  lab.test('codesHaveBeenSelected', async () => {
    getStub.resolves(new DataStore({ data: { applicationWasteDisposalAndRecoveryCodes: {} } }))
    const wasteDisposalAndRecoveryCodes = await WasteDisposalAndRecoveryCodes.getForActivity(undefined, 0)
    const codesHaveBeenSelected = wasteDisposalAndRecoveryCodes.codesHaveBeenSelected
    Code.expect(codesHaveBeenSelected).to.be.false()
  })

  lab.experiment('getAllCodesHaveBeenSelectedForApplication', () => {
    let storedData = {}
    lab.beforeEach(() => {
      getStub.resolves(new DataStore({ data: { applicationWasteDisposalAndRecoveryCodes: storedData } }))
    })
    lab.test('empty', async () => {
      getStub.resolves(new DataStore({ data: { applicationWasteDisposalAndRecoveryCodes: {} } }))
      const allCodesHaveBeenSelectedForApplication = await WasteDisposalAndRecoveryCodes.getAllCodesHaveBeenSelectedForApplication()
      Code.expect(allCodesHaveBeenSelectedForApplication).to.be.false()
    })

    lab.test('started but not selected disposal codes', async () => {
      Object.assign(storedData, {
        'a': {
          selectedWasteDisposalCodes: []
        }
      })
      const allCodesHaveBeenSelectedForApplication = await WasteDisposalAndRecoveryCodes.getAllCodesHaveBeenSelectedForApplication()
      Code.expect(allCodesHaveBeenSelectedForApplication).to.be.false()
    })

    lab.test('started but not selected recovery codes', async () => {
      Object.assign(storedData, {
        'a': {
          selectedWasteRecoveryCodes: []
        }
      })
      const allCodesHaveBeenSelectedForApplication = await WasteDisposalAndRecoveryCodes.getAllCodesHaveBeenSelectedForApplication()
      Code.expect(allCodesHaveBeenSelectedForApplication).to.be.false()
    })

    lab.test('only one completed', async () => {
      Object.assign(storedData, {
        'b': {
          selectedWasteDisposalCodes: ['d01']
        }
      })
      const allCodesHaveBeenSelectedForApplication = await WasteDisposalAndRecoveryCodes.getAllCodesHaveBeenSelectedForApplication()
      Code.expect(allCodesHaveBeenSelectedForApplication).to.be.false()
    })

    lab.test('all completed', async () => {
      Object.assign(storedData, {
        'a': {
          selectedWasteDisposalCodes: ['d01'],
          selectedWasteRecoveryCodes: []
        },
        'b': {
          selectedWasteDisposalCodes: [],
          selectedWasteRecoveryCodes: ['r01']
        },
        'c': {
          selectedWasteRecoveryCodes: ['r01', 'r02']
        }
      })
      const allCodesHaveBeenSelectedForApplication = await WasteDisposalAndRecoveryCodes.getAllCodesHaveBeenSelectedForApplication()
      Code.expect(allCodesHaveBeenSelectedForApplication).to.be.true()
    })
  })
})
