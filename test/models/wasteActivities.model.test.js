'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')

const ItemEntity = require('../../src/persistence/entities/item.entity')
const WasteActivities = require('../../src/models/wasteActivities.model')
const DataStore = require('../../src/models/dataStore.model')

const fakeWasteActivityList = [{
  shortName: 'FAKE_ACTIVITY_ID',
  itemName: 'Fake activity text'
}, {
  shortName: 'FAKE_ACTIVITY_ID2',
  itemName: 'Fake activity 2 text'
}, {
  shortName: '1-16-9',
  itemName: 'Fake activity 3 text'
}]
let mocks

lab.experiment('WasteActivities test:', () => {
  let sandbox

  lab.beforeEach(() => {
    mocks = new Mocks()

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub methods
    sandbox.stub(ItemEntity, 'listWasteActivities').resolves(fakeWasteActivityList)
    sandbox.stub(DataStore, 'get').resolves(mocks.dataStore)
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.test('getAllWasteActivities', async () => {
    const allWasteActivities = await WasteActivities.getAllWasteActivities()
    Code.expect(allWasteActivities).to.exist()
    Code.expect(allWasteActivities.length).to.equal(3)
  })

  lab.test('get wasteActivitiesLength', async () => {
    const allWasteActivities = await WasteActivities.getAllWasteActivities()
    const wasteActivities = new WasteActivities(allWasteActivities, [{ id: 'FAKE_ACTIVITY_ID', referenceName: 'Fake name' }])
    Code.expect(wasteActivities.wasteActivitiesLength).to.equal(1)
  })

  lab.test('get textForNumberOfWasteActivities', async () => {
    const dummyActivity = { id: 'FAKE_ACTIVITY_ID', referenceName: 'Fake name' }
    const allWasteActivities = await WasteActivities.getAllWasteActivities()
    let wasteActivities
    wasteActivities = new WasteActivities(allWasteActivities)
    Code.expect(wasteActivities.textForNumberOfWasteActivities).to.equal('no activities')
    wasteActivities = new WasteActivities(allWasteActivities, [dummyActivity])
    Code.expect(wasteActivities.textForNumberOfWasteActivities).to.equal('1 activity')
    wasteActivities = new WasteActivities(allWasteActivities, [dummyActivity, dummyActivity])
    Code.expect(wasteActivities.textForNumberOfWasteActivities).to.equal('2 activities')
  })

  lab.test('get wasteActivitiesValues', async () => {
    const allWasteActivities = await WasteActivities.getAllWasteActivities()
    const wasteActivities = new WasteActivities(allWasteActivities, [{ id: 'FAKE_ACTIVITY_ID', referenceName: 'Fake name' }])
    const wasteActivitiesValues = wasteActivities.wasteActivitiesValues
    Code.expect(wasteActivitiesValues).to.exist()
    Code.expect(wasteActivitiesValues.length).to.equal(1)
    Code.expect(wasteActivitiesValues[0].id).to.equal('FAKE_ACTIVITY_ID')
    Code.expect(wasteActivitiesValues[0].referenceName).to.equal('Fake name')
    Code.expect(wasteActivitiesValues[0].item).to.exist()
    Code.expect(wasteActivitiesValues[0].item.shortName).to.equal('FAKE_ACTIVITY_ID')
  })

  lab.test('get wasteActivitiesData', async () => {
    const allWasteActivities = await WasteActivities.getAllWasteActivities()
    const wasteActivities = new WasteActivities(allWasteActivities, [{ id: 'FAKE_ACTIVITY_ID', referenceName: 'Fake name' }])
    const wasteActivitiesData = wasteActivities.wasteActivitiesData
    Code.expect(wasteActivitiesData).to.exist()
    Code.expect(wasteActivitiesData.length).to.equal(1)
    Code.expect(wasteActivitiesData[0].id).to.equal('FAKE_ACTIVITY_ID')
    Code.expect(wasteActivitiesData[0].referenceName).to.equal('Fake name')
    Code.expect(wasteActivitiesData[0].item).to.not.exist()
  })

  lab.experiment('get wasteActivityNames:', () => {
    lab.test('Correct list when there is a reference name', async () => {
      const allWasteActivities = await WasteActivities.getAllWasteActivities()
      const wasteActivities = new WasteActivities(allWasteActivities, [{ id: 'FAKE_ACTIVITY_ID', referenceName: 'Fake name' }])
      const wasteActivityNames = wasteActivities.wasteActivityNames
      Code.expect(wasteActivityNames).to.exist()
      Code.expect(wasteActivityNames.length).to.equal(1)
      Code.expect(wasteActivityNames[0]).to.equal('Fake activity text – Fake name')
    })

    lab.test('Correct list when there is no reference name', async () => {
      const allWasteActivities = await WasteActivities.getAllWasteActivities()
      const wasteActivities = new WasteActivities(allWasteActivities, [{ id: 'FAKE_ACTIVITY_ID' }])
      const wasteActivityNames = wasteActivities.wasteActivityNames
      Code.expect(wasteActivityNames).to.exist()
      Code.expect(wasteActivityNames.length).to.equal(1)
      Code.expect(wasteActivityNames[0]).to.equal('Fake activity text')
    })
  })

  lab.experiment('hasDuplicateWasteActivities:', () => {
    lab.test('false when no activities', async () => {
      const wasteActivities = new WasteActivities([], [])
      Code.expect(wasteActivities.hasDuplicateWasteActivities).to.be.false()
    })

    lab.test('false when no duplicates', async () => {
      const wasteActivities = new WasteActivities([], [
        { id: 'FAKE_ACTIVITY_ID', referenceName: '' },
        { id: 'FAKE_ACTIVITY_ID2', referenceName: '' }
      ])
      Code.expect(wasteActivities.hasDuplicateWasteActivities).to.be.false()
    })

    lab.test('true when duplicates', async () => {
      const wasteActivities = new WasteActivities([], [
        { id: 'FAKE_ACTIVITY_ID', referenceName: '' },
        { id: 'FAKE_ACTIVITY_ID2', referenceName: '' },
        { id: 'FAKE_ACTIVITY_ID2', referenceName: '' },
        { id: 'FAKE_ACTIVITY_ID3', referenceName: '' }
      ])
      Code.expect(wasteActivities.hasDuplicateWasteActivities).to.be.true()
    })
  })

  lab.experiment('duplicateWasteActivitiesValues:', () => {
    lab.test('empty when no activities', async () => {
      const wasteActivities = new WasteActivities([], [])
      Code.expect(wasteActivities.duplicateWasteActivitiesValues).to.be.empty()
    })

    lab.test('empty when no duplicates', async () => {
      const wasteActivities = new WasteActivities([], [
        { id: 'FAKE_ACTIVITY_ID', referenceName: '' },
        { id: 'FAKE_ACTIVITY_ID2', referenceName: '' }
      ])
      Code.expect(wasteActivities.duplicateWasteActivitiesValues).to.be.empty()
    })

    lab.test('correct when duplicates', async () => {
      const wasteActivities = new WasteActivities([], [
        { id: 'FAKE_ACTIVITY_ID', referenceName: '' },
        { id: 'FAKE_ACTIVITY_ID2', referenceName: '' },
        { id: 'FAKE_ACTIVITY_ID2', referenceName: '' },
        { id: 'FAKE_ACTIVITY_ID3', referenceName: '' },
        { id: 'FAKE_ACTIVITY_ID4', referenceName: '' },
        { id: 'FAKE_ACTIVITY_ID4', referenceName: '' }
      ])
      const duplicateValues = wasteActivities.duplicateWasteActivitiesValues
      const duplicateIndexes = duplicateValues.map(({ index }) => index)
      Code.expect(duplicateIndexes).to.equal([1, 2, 4, 5])
      const duplicateOrders = duplicateValues.map(({ order }) => order)
      Code.expect(duplicateOrders).to.equal([1, 2, 1, 2])
    })
  })

  lab.experiment('get:', () => {
    lab.test('Works with no data', async () => {
      mocks.dataStore.data = {}
      const wasteActivities = await WasteActivities.get(mocks.context)
      Code.expect(wasteActivities).to.exist()
      Code.expect(wasteActivities.selectedWasteActivities).to.exist()
      Code.expect(wasteActivities.selectedWasteActivities.length).to.equal(0)
    })
    lab.test('Works with no pre-selected values', async () => {
      mocks.dataStore.data = { wasteActivities: [] }
      const wasteActivities = await WasteActivities.get(mocks.context)
      Code.expect(wasteActivities).to.exist()
      Code.expect(wasteActivities.selectedWasteActivities).to.exist()
      Code.expect(wasteActivities.selectedWasteActivities.length).to.equal(0)
    })
    lab.test('Works with pre-selected values', async () => {
      mocks.dataStore.data = {
        wasteActivities: [
          { id: 'FAKE_ACTIVITY_ID', referenceName: 'Fake 1' },
          { id: 'FAKE_ACTIVITY_ID', referenceName: 'Fake 2' }
        ]
      }
      const wasteActivities = await WasteActivities.get(mocks.context)
      Code.expect(wasteActivities).to.exist()
      Code.expect(wasteActivities.selectedWasteActivities).to.exist()
      Code.expect(wasteActivities.selectedWasteActivities.length).to.equal(2)
    })
  })

  lab.experiment('save:', () => {
    let dataStoreSpy
    lab.beforeEach(() => {
      dataStoreSpy = sandbox.stub(DataStore.prototype, 'save')
      dataStoreSpy.resolves({})
    })

    lab.test('Works with changed values', async () => {
      mocks.dataStore.data = {
        wasteActivities: [
          { id: 'FAKE_ACTIVITY_ID', referenceName: 'Fake 1' },
          { id: 'FAKE_ACTIVITY_ID', referenceName: 'Fake 2' }
        ]
      }
      const wasteActivities = await WasteActivities.get(mocks.context)
      wasteActivities.selectedWasteActivities.push({ id: 'FAKE_ACTIVITY_ID', name: 'Fake 3' })
      await wasteActivities.save(mocks.context)
      Code.expect(dataStoreSpy.called).to.be.true()
      const dataStoreToBeSaved = dataStoreSpy.thisValues[0]
      Code.expect(dataStoreToBeSaved).to.exist()
      Code.expect(dataStoreToBeSaved.data).to.exist()
      Code.expect(dataStoreToBeSaved.data.wasteActivities).to.exist()
      Code.expect(dataStoreToBeSaved.data.wasteActivities.length).to.equal(3)
    })
  })

  lab.experiment('addWasteActivity:', () => {
    lab.beforeEach(() => {
      mocks.dataStore.data = {
        wasteActivities: [
          { id: 'FAKE_ACTIVITY_ID', referenceName: 'Fake 1' },
          { id: 'FAKE_ACTIVITY_ID2', referenceName: 'Fake 2' }
        ]
      }
    })

    lab.test('Correctly adds to an empty list', async () => {
      mocks.dataStore.data = { wasteActivities: [] }
      const wasteActivities = await WasteActivities.get(mocks.context)
      wasteActivities.addWasteActivity('FAKE_ACTIVITY_ID')
      Code.expect(wasteActivities.selectedWasteActivities.length).to.equal(1)
      Code.expect(wasteActivities.selectedWasteActivities[0].id).to.equal('FAKE_ACTIVITY_ID')
      Code.expect(wasteActivities.selectedWasteActivities[0].referenceName).to.be.empty()
    })

    lab.test('Correctly adds at the end', async () => {
      const wasteActivities = await WasteActivities.get(mocks.context)
      wasteActivities.addWasteActivity('1-16-9')
      Code.expect(wasteActivities.selectedWasteActivities.length).to.equal(3)
      Code.expect(wasteActivities.selectedWasteActivities[2].id).to.equal('1-16-9')
      Code.expect(wasteActivities.selectedWasteActivities[2].referenceName).to.be.empty()
    })

    lab.test('Correctly adds in the middle', async () => {
      const wasteActivities = await WasteActivities.get(mocks.context)
      wasteActivities.addWasteActivity('FAKE_ACTIVITY_ID')
      Code.expect(wasteActivities.selectedWasteActivities.length).to.equal(3)
      Code.expect(wasteActivities.selectedWasteActivities[1].id).to.equal('FAKE_ACTIVITY_ID')
      Code.expect(wasteActivities.selectedWasteActivities[1].referenceName).to.be.empty()
    })

    lab.test(`Doesn't add invalid activity`, async () => {
      const wasteActivities = await WasteActivities.get(mocks.context)
      wasteActivities.addWasteActivity('INVALID_ACTIVITY_ID')
      Code.expect(wasteActivities.selectedWasteActivities.length).to.equal(2)
    })

    lab.test(`Doesn't add if the list is full`, async () => {
      mocks.dataStore.data.wasteActivities = []
      for (let i = 0; i < 50; i++) {
        mocks.dataStore.data.wasteActivities.push({ id: 'FAKE_ACTIVITY_ID', referenceName: 'Fake 1' })
      }
      const wasteActivities = await WasteActivities.get(mocks.context)
      Code.expect(wasteActivities.selectedWasteActivities.length).to.equal(50)
      Code.expect(wasteActivities.isFull).to.be.true()
      wasteActivities.addWasteActivity('FAKE_ACTIVITY_ID')
      Code.expect(wasteActivities.selectedWasteActivities.length).to.equal(50)
    })
  })

  lab.experiment('deleteWasteActivity:', () => {
    lab.beforeEach(() => {
      mocks.dataStore.data = {
        wasteActivities: [
          { id: 'FAKE_ACTIVITY_ID', referenceName: 'Fake 1' },
          { id: 'FAKE_ACTIVITY_ID', referenceName: 'Fake 2' },
          { id: 'FAKE_ACTIVITY_ID', referenceName: 'Fake 3' }
        ]
      }
    })

    lab.test(`Deletes existing activity`, async () => {
      const wasteActivities = await WasteActivities.get(mocks.context)
      const wasteActivity = wasteActivities.deleteWasteActivity(1)
      Code.expect(wasteActivity).to.exist()
      Code.expect(wasteActivity.referenceName).to.equal('Fake 2')
      Code.expect(wasteActivities.wasteActivitiesLength).to.equal(2)
    })

    lab.test(`Doesn't delete non-existent activity`, async () => {
      const wasteActivities = await WasteActivities.get(mocks.context)
      const wasteActivity = wasteActivities.deleteWasteActivity('not-an-index')
      Code.expect(wasteActivity).to.not.exist()
      Code.expect(wasteActivities.wasteActivitiesLength).to.equal(3)
    })

    lab.test(`Keeps referenceName for entries that are still duplicates`, async () => {
      const wasteActivities = await WasteActivities.get(mocks.context)
      wasteActivities.deleteWasteActivity(0)
      Code.expect(wasteActivities.wasteActivitiesLength).to.equal(2)
      Code.expect(wasteActivities.selectedWasteActivities[0].referenceName).to.equal('Fake 2')
      Code.expect(wasteActivities.selectedWasteActivities[1].referenceName).to.equal('Fake 3')
    })

    lab.test(`Clears referenceName for entry that is no longer a duplicate`, async () => {
      const wasteActivities = await WasteActivities.get(mocks.context)
      wasteActivities.deleteWasteActivity(0)
      wasteActivities.deleteWasteActivity(0)
      Code.expect(wasteActivities.wasteActivitiesLength).to.equal(1)
      Code.expect(wasteActivities.selectedWasteActivities[0].referenceName).to.not.exist()
    })
  })

  lab.experiment('setWasteActivityReferenceName:', () => {
    lab.beforeEach(() => {
      mocks.dataStore.data = {
        wasteActivities: [
          { id: 'FAKE_ACTIVITY_ID', referenceName: 'Fake 1' },
          { id: 'FAKE_ACTIVITY_ID', referenceName: '' },
          { id: 'FAKE_ACTIVITY_ID' }
        ]
      }
    })

    lab.test(`Updates existing value`, async () => {
      const wasteActivities = await WasteActivities.get(mocks.context)
      const wasteActivity = wasteActivities.setWasteActivityReferenceName(0, 'New name')
      Code.expect(wasteActivity).to.exist()
      Code.expect(wasteActivities.selectedWasteActivities[0].referenceName).to.equal('New name')
    })

    lab.test(`Updates blank value`, async () => {
      const wasteActivities = await WasteActivities.get(mocks.context)
      const wasteActivity = wasteActivities.setWasteActivityReferenceName(1, 'New name')
      Code.expect(wasteActivity).to.exist()
      Code.expect(wasteActivities.selectedWasteActivities[1].referenceName).to.equal('New name')
    })

    lab.test(`Sets non-existent value`, async () => {
      const wasteActivities = await WasteActivities.get(mocks.context)
      const wasteActivity = wasteActivities.setWasteActivityReferenceName(2, 'New name')
      Code.expect(wasteActivity).to.exist()
      Code.expect(wasteActivities.selectedWasteActivities[2].referenceName).to.equal('New name')
    })

    lab.test(`Doesn't update non-existent activity`, async () => {
      const wasteActivities = await WasteActivities.get(mocks.context)
      const wasteActivity = wasteActivities.setWasteActivityReferenceName('not-an-index', 'New name')
      Code.expect(wasteActivity).to.not.exist()
    })
  })
})
