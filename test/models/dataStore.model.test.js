'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')

const ApplicationData = require('../../src/persistence/entities/applicationData.entity')
const DataStore = require('../../src/models/dataStore.model')

const context = { }

let mocks

lab.experiment('Data test:', () => {
  let sandbox

  lab.beforeEach(() => {
    mocks = new Mocks()

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub methods
    sandbox.stub(ApplicationData, 'getById').value(() => mocks.applicationData)
    sandbox.stub(ApplicationData, 'getBy').value(() => mocks.applicationData)
    sandbox.stub(ApplicationData.prototype, 'save').value(() => undefined)
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('get', () => {
    lab.test('via id', async () => {
      const dataStore = await DataStore.get(context, { id: mocks.applicationData.id })
      Code.expect(dataStore.id).to.equal(mocks.applicationData.id)
    })

    lab.test('via applicationId', async () => {
      const dataStore = await DataStore.get(context)
      Code.expect(dataStore.id).to.equal(mocks.applicationData.id)
    })
  })

  lab.experiment('save', () => {
    lab.test('via create', async () => {
      mocks.dataStore.id = undefined
      const dataStore = new DataStore(mocks.dataStore)
      await dataStore.save(context)
      Code.expect(dataStore).to.equal(mocks.dataStore)
    })

    lab.test('via update', async () => {
      const dataStore = new DataStore(mocks.dataStore)
      const id = await dataStore.save(context)
      Code.expect(id).to.equal(mocks.dataStore.id)
      Code.expect(dataStore).to.equal(mocks.dataStore)
    })
  })
})
