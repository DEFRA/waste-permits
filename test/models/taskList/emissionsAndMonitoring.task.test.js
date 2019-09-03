'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const Annotation = require('../../../src/persistence/entities/annotation.entity')
const DataStore = require('../../../src/models/dataStore.model')
const EmissionsAndMonitoring = require('../../../src/models/taskList/emissionsAndMonitoring.task')

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: EmissionsAndMonitoring Model tests:', () => {
  lab.test(`checkComplete() method correctly returns FALSE when annotations don't exist and details required true`, async () => {
    sandbox.stub(Annotation, 'listByApplicationIdAndSubject').value(() => [])
    sandbox.stub(DataStore, 'get').value(() => { return { data: { emissionsAndMonitoringDetailsRequired: true } } })

    const result = await EmissionsAndMonitoring.checkComplete(mocks.context)
    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns TRUE when annotations exist and details required true', async () => {
    sandbox.stub(Annotation, 'listByApplicationIdAndSubject').value(() => [{}])
    sandbox.stub(DataStore, 'get').value(() => { return { data: { emissionsAndMonitoringDetailsRequired: true } } })

    const result = await EmissionsAndMonitoring.checkComplete(mocks.context)
    Code.expect(result).to.equal(true)
  })

  lab.test(`checkComplete() method correctly returns TRUE when details required is false`, async () => {
    sandbox.stub(Annotation, 'listByApplicationIdAndSubject').value(() => [])
    sandbox.stub(DataStore, 'get').value(() => { return { data: { emissionsAndMonitoringDetailsRequired: false } } })

    const result = await EmissionsAndMonitoring.checkComplete(mocks.context)
    Code.expect(result).to.equal(true)
  })

  lab.test(`checkComplete() method correctly returns FALSE when details required not specified`, async () => {
    sandbox.stub(Annotation, 'listByApplicationIdAndSubject').value(() => [])
    sandbox.stub(DataStore, 'get').value(() => { return { data: { emissionsAndMonitoringDetailsRequired: undefined } } })

    const result = await EmissionsAndMonitoring.checkComplete(mocks.context)
    Code.expect(result).to.equal(false)
  })
})
