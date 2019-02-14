'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const AirQualityManagementModel = require('../../../src/models/airQualityManagement.model')
const Application = require('../../../src/persistence/entities/application.entity')
const AirQualityManagementTask = require('../../../src/models/taskList/airQualityManagement.task')

const TEST_AQMA_NAME = 'Test AQMA'
const TEST_NO2_LEVEL = 42
const TEST_AUTH_NAME = 'Test authority'

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(AirQualityManagementModel, 'get').callsFake(async () => mocks.airQualityManagement)
  sandbox.stub(AirQualityManagementModel.prototype, 'save').callsFake(async () => null)
  sandbox.stub(Application, 'getById').callsFake(async () => mocks.application)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: AirQualityManagement Model tests:', () => {
  lab.test('isComplete() method correctly returns FALSE initially', async () => {
    const result = await AirQualityManagementTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
  })

  lab.test('isComplete() method correctly returns TRUE when AQMA is set as false', async () => {
    mocks.airQualityManagement.aqmaIsInAqma = false
    const result = await AirQualityManagementTask.isComplete(mocks.context)
    Code.expect(result).to.equal(true)
  })

  lab.test('isComplete() method correctly returns TRUE when AQMA is set as true and all data entered', async () => {
    mocks.airQualityManagement.aqmaIsInAqma = true
    mocks.airQualityManagement.aqmaName = TEST_AQMA_NAME
    mocks.airQualityManagement.aqmaNitrogenDioxideLevel = TEST_NO2_LEVEL
    mocks.airQualityManagement.aqmaLocalAuthorityName = TEST_AUTH_NAME
    const result = await AirQualityManagementTask.isComplete(mocks.context)
    Code.expect(result).to.equal(true)
  })

  lab.test('isComplete() method correctly returns FALSE when AQMA is set as true and data is incomplete', async () => {
    let result

    mocks.airQualityManagement.aqmaIsInAqma = true
    result = await AirQualityManagementTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)

    mocks.airQualityManagement.aqmaName = TEST_AQMA_NAME
    result = await AirQualityManagementTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
    delete mocks.airQualityManagement.aqmaName

    mocks.airQualityManagement.aqmaNitrogenDioxideLevel = TEST_NO2_LEVEL
    result = await AirQualityManagementTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
    delete mocks.airQualityManagement.aqmaNitrogenDioxideLevel

    mocks.airQualityManagement.aqmaLocalAuthorityName = TEST_AUTH_NAME
    result = await AirQualityManagementTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
    delete mocks.airQualityManagement.aqmaLocalAuthorityName

    mocks.airQualityManagement.aqmaName = TEST_AQMA_NAME
    mocks.airQualityManagement.aqmaNitrogenDioxideLevel = TEST_NO2_LEVEL
    result = await AirQualityManagementTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
    delete mocks.airQualityManagement.aqmaName
    delete mocks.airQualityManagement.aqmaNitrogenDioxideLevel

    mocks.airQualityManagement.aqmaNitrogenDioxideLevel = TEST_NO2_LEVEL
    mocks.airQualityManagement.aqmaLocalAuthorityName = TEST_AUTH_NAME
    result = await AirQualityManagementTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
    delete mocks.airQualityManagement.aqmaNitrogenDioxideLevel
    delete mocks.airQualityManagement.aqmaLocalAuthorityName
  })
})
