'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const WasteWeights = require('../../src/models/wasteWeights.model')
const DataStore = require('../../src/models/dataStore.model')
const ApplicationLine = require('../../src/persistence/entities/applicationLine.entity')
const Item = require('../../src/persistence/entities/item.entity')
const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')

lab.experiment('WasteWeights test:', () => {
  let sandbox
  let listStub
  let getDataStoreStub
  let saveAnswerSpy

  lab.beforeEach(() => {
    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub methods
    listStub = sandbox.stub(ApplicationLine, 'listForWasteActivities')
    listStub.resolves([{ id: 'a' }, { id: 'b', lineName: 'Line B' }, { id: 'c', lineName: 'Line C' }])
    getDataStoreStub = sandbox.stub(DataStore, 'get')
    getDataStoreStub.resolves(new DataStore({ data: { acceptsHazardousWaste: true } }))
    saveAnswerSpy = sandbox.stub(ApplicationAnswer.prototype,'save')
    saveAnswerSpy.resolves()
    sandbox.stub(Item,'getById').resolves({ itemName: 'Dummy item name' })
    sandbox.stub(Item,'listBy').resolves([{ itemName: 'Dummy item name' }])
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('getForActivity', () => {
    let listAnswerStub
    lab.beforeEach(() => {
      listAnswerStub = sandbox.stub(ApplicationAnswer, 'listForApplicationLine')
      listAnswerStub.resolves([
        { questionCode: 'non-haz-waste-throughput-weight', answerText: '1' },
        { questionCode: 'non-haz-waste-maximum-weight', answerText: '2' },
        { questionCode: 'haz-waste-throughput-weight', answerText: '3' },
        { questionCode: 'haz-waste-maximum-weight', answerText: '4' }
      ])
    })

    lab.test('correctly identifies if has hazardous waste', async () => {
      const wasteWeightsWithHazardous = await WasteWeights.getForActivity(undefined, 0)
      Code.expect(wasteWeightsWithHazardous.hasHazardousWaste).to.be.true()
      getDataStoreStub.resolves(new DataStore({ data: { acceptsHazardousWaste: false } }))
      const wasteWeightsWithoutHazardous = await WasteWeights.getForActivity(undefined, 0)
      Code.expect(wasteWeightsWithoutHazardous.hasHazardousWaste).to.be.false()
      getDataStoreStub.resolves(new DataStore({ data: {} }))
      const wasteWeightsUnspecifiedHazardous = await WasteWeights.getForActivity(undefined, 0)
      Code.expect(wasteWeightsUnspecifiedHazardous.hasHazardousWaste).to.be.false()
    })
    lab.test('returns empty when not entered', async () => {
      listAnswerStub.resolves([])
      const wasteWeights = await WasteWeights.getForActivity(undefined, 0)
      Code.expect(wasteWeights).to.exist()
      Code.expect(wasteWeights.nonHazardousThroughput).to.not.exist()
      Code.expect(wasteWeights.nonHazardousMaximum).to.not.exist()
      Code.expect(wasteWeights.hazardousThroughput).to.not.exist()
      Code.expect(wasteWeights.hazardousMaximum).to.not.exist()
    })
    lab.test('returns content when entered', async () => {
      const wasteWeights = await WasteWeights.getForActivity(undefined, 1)
      Code.expect(wasteWeights).to.exist()
      Code.expect(wasteWeights.nonHazardousThroughput).to.equal('1')
      Code.expect(wasteWeights.nonHazardousMaximum).to.equal('2')
      Code.expect(wasteWeights.hazardousThroughput).to.equal('3')
      Code.expect(wasteWeights.hazardousMaximum).to.equal('4')
    })
    lab.test('returns nothing when invalid activity', async () => {
      const wasteWeights = await WasteWeights.getForActivity(undefined, 99)
      Code.expect(wasteWeights).to.not.exist()
    })
  })

  lab.experiment('getAllForApplication', () => {
    let listAnswerStub
    lab.beforeEach(() => {
      listAnswerStub = sandbox.stub(ApplicationAnswer, 'listByMultipleQuestionCodes')
      listAnswerStub.resolves([
        { applicationLineId: 'b', questionCode: 'non-haz-waste-throughput-weight', answerText: '1' },
        { applicationLineId: 'b', questionCode: 'non-haz-waste-maximum-weight', answerText: '2' },
        { applicationLineId: 'b', questionCode: 'haz-waste-throughput-weight', answerText: '3' },
        { applicationLineId: 'b', questionCode: 'haz-waste-maximum-weight', answerText: '4' }
      ])
    })

    lab.test('returns empty when not entered', async () => {
      const allWasteWeights = await WasteWeights.getAllForApplication()
      Code.expect(allWasteWeights).to.exist()
      const wasteWeights = allWasteWeights[0]
      Code.expect(wasteWeights).to.exist()
      Code.expect(wasteWeights.hasHazardousWaste).to.be.true(0)
      Code.expect(wasteWeights.nonHazardousThroughput).to.not.exist()
    })
    lab.test('returns content when entered', async () => {
      const allWasteWeights = await WasteWeights.getAllForApplication()
      Code.expect(allWasteWeights).to.exist()
      const wasteWeights = allWasteWeights[1]
      Code.expect(wasteWeights).to.exist()
      Code.expect(wasteWeights.hasHazardousWaste).to.be.true(0)
      Code.expect(wasteWeights.nonHazardousThroughput).to.equal('1')
      Code.expect(wasteWeights.nonHazardousMaximum).to.equal('2')
      Code.expect(wasteWeights.hazardousThroughput).to.equal('3')
      Code.expect(wasteWeights.hazardousMaximum).to.equal('4')
    })
    lab.test('returns empty when no lines', async () => {
      listStub.resolves(undefined)
      const allWasteWeights = await WasteWeights.getAllForApplication()
      Code.expect(allWasteWeights).to.exist()
      Code.expect(allWasteWeights.length).to.equal(0)
    })
  })

  lab.experiment('save', () => {
    lab.test('non-hazardous', async () => {
      const wasteWeights = new WasteWeights()
      await wasteWeights.save()
      Code.expect(saveAnswerSpy.callCount).to.equal(4)
    })
    lab.test('hazardous', async () => {
      const wasteWeights = new WasteWeights({ hasHazardousWaste: true })
      await wasteWeights.save()
      Code.expect(saveAnswerSpy.callCount).to.equal(4)
    })
  })

  lab.test('get listOfWeights', async () => {
    let wasteWeights
    wasteWeights = new WasteWeights({ hasHazardousWaste: true, nonHazardousThroughput: '1', nonHazardousMaximum: '2', hazardousThroughput: '3', hazardousMaximum: '4' })
    Code.expect(wasteWeights.listOfWeights).to.equal(['1', '2', '3', '4'])
    wasteWeights = new WasteWeights({ hasHazardousWaste: false, nonHazardousThroughput: '1', nonHazardousMaximum: '2', hazardousThroughput: '3', hazardousMaximum: '4' })
    Code.expect(wasteWeights.listOfWeights).to.equal(['1', '2'])
    wasteWeights = new WasteWeights({ hasHazardousWaste: true, nonHazardousMaximum: '2', hazardousMaximum: '4' })
    Code.expect(wasteWeights.listOfWeights).to.equal(['', '2', '', '4'])
    wasteWeights = new WasteWeights({ hasHazardousWaste: true, nonHazardousThroughput: '1', hazardousThroughput: '3' })
    Code.expect(wasteWeights.listOfWeights).to.equal(['1', '', '3', ''])
  })

  lab.experiment('getAllWeightsHaveBeenEnteredForApplication', () => {
    let listAnswerStub
    lab.beforeEach(() => {
      listAnswerStub = sandbox.stub(ApplicationAnswer, 'listByMultipleQuestionCodes')
      listAnswerStub.resolves([])
    })

    lab.test('nothing entered', async () => {
      const allWeightsHaveBeenEnteredForApplication = await WasteWeights.getAllWeightsHaveBeenEnteredForApplication()
      Code.expect(allWeightsHaveBeenEnteredForApplication).to.be.false()
    })

    lab.test('completed one', async () => {
      listAnswerStub.resolves([
        { applicationLineId: 'a', questionCode: 'non-haz-waste-throughput-weight', answerText: '1' },
        { applicationLineId: 'a', questionCode: 'non-haz-waste-maximum-weight', answerText: '2' },
        { applicationLineId: 'a', questionCode: 'haz-waste-throughput-weight', answerText: '3' },
        { applicationLineId: 'a', questionCode: 'haz-waste-maximum-weight', answerText: '4' }
      ])
      const allWeightsHaveBeenEnteredForApplication = await WasteWeights.getAllWeightsHaveBeenEnteredForApplication()
      Code.expect(allWeightsHaveBeenEnteredForApplication).to.be.false()
    })

    lab.test('completed all', async () => {
      listAnswerStub.resolves([
        { applicationLineId: 'a', questionCode: 'non-haz-waste-throughput-weight', answerText: '1' },
        { applicationLineId: 'a', questionCode: 'non-haz-waste-maximum-weight', answerText: '2' },
        { applicationLineId: 'a', questionCode: 'haz-waste-throughput-weight', answerText: '3' },
        { applicationLineId: 'a', questionCode: 'haz-waste-maximum-weight', answerText: '4' },
        { applicationLineId: 'b', questionCode: 'non-haz-waste-throughput-weight', answerText: '1' },
        { applicationLineId: 'b', questionCode: 'non-haz-waste-maximum-weight', answerText: '2' },
        { applicationLineId: 'b', questionCode: 'haz-waste-throughput-weight', answerText: '3' },
        { applicationLineId: 'b', questionCode: 'haz-waste-maximum-weight', answerText: '4' },
        { applicationLineId: 'c', questionCode: 'non-haz-waste-throughput-weight', answerText: '1' },
        { applicationLineId: 'c', questionCode: 'non-haz-waste-maximum-weight', answerText: '2' },
        { applicationLineId: 'c', questionCode: 'haz-waste-throughput-weight', answerText: '3' },
        { applicationLineId: 'c', questionCode: 'haz-waste-maximum-weight', answerText: '4' }
      ])
      const allWeightsHaveBeenEnteredForApplication = await WasteWeights.getAllWeightsHaveBeenEnteredForApplication()
      Code.expect(allWeightsHaveBeenEnteredForApplication).to.be.true()
    })

    lab.test('completed all when does not have hazardous waste', async () => {
      getDataStoreStub.resolves(new DataStore({ data: { acceptsHazardousWaste: false } }))
      listAnswerStub.resolves([
        { applicationLineId: 'a', questionCode: 'non-haz-waste-throughput-weight', answerText: '1' },
        { applicationLineId: 'a', questionCode: 'non-haz-waste-maximum-weight', answerText: '2' },
        { applicationLineId: 'b', questionCode: 'non-haz-waste-throughput-weight', answerText: '1' },
        { applicationLineId: 'b', questionCode: 'non-haz-waste-maximum-weight', answerText: '2' },
        { applicationLineId: 'c', questionCode: 'non-haz-waste-throughput-weight', answerText: '1' },
        { applicationLineId: 'c', questionCode: 'non-haz-waste-maximum-weight', answerText: '2' }
      ])
      const allWeightsHaveBeenEnteredForApplication = await WasteWeights.getAllWeightsHaveBeenEnteredForApplication()
      Code.expect(allWeightsHaveBeenEnteredForApplication).to.be.true()
    })
  })
})