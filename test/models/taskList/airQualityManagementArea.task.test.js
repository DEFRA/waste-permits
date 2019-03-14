'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const AirQualityManagementAreaModel = require('../../../src/models/airQualityManagementArea.model')
const Application = require('../../../src/persistence/entities/application.entity')
const AirQualityManagementAreaTask = require('../../../src/models/taskList/airQualityManagementArea.task')

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
  sandbox.stub(AirQualityManagementAreaModel, 'get').callsFake(async () => mocks.airQualityManagementArea)
  sandbox.stub(AirQualityManagementAreaModel.prototype, 'save').callsFake(async () => null)
  sandbox.stub(Application, 'getById').callsFake(async () => mocks.application)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: AirQualityManagementArea Model tests:', () => {
  lab.test('isComplete() method correctly returns FALSE initially', async () => {
    const result = await AirQualityManagementAreaTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
  })

  lab.test('isComplete() method correctly returns TRUE when AQMA is set as false', async () => {
    mocks.airQualityManagementArea.aqmaIsInAqma = false
    const result = await AirQualityManagementAreaTask.isComplete(mocks.context)
    Code.expect(result).to.equal(true)
  })

  lab.test('isComplete() method correctly returns TRUE when AQMA is set as true and all data entered', async () => {
    mocks.airQualityManagementArea.aqmaIsInAqma = true
    mocks.airQualityManagementArea.aqmaName = TEST_AQMA_NAME
    mocks.airQualityManagementArea.aqmaNitrogenDioxideLevel = TEST_NO2_LEVEL
    mocks.airQualityManagementArea.aqmaLocalAuthorityName = TEST_AUTH_NAME
    const result = await AirQualityManagementAreaTask.isComplete(mocks.context)
    Code.expect(result).to.equal(true)
  })

  lab.test('isComplete() method correctly returns FALSE when AQMA is set as true and data is incomplete', async () => {
    let result

    mocks.airQualityManagementArea.aqmaIsInAqma = true
    result = await AirQualityManagementAreaTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)

    mocks.airQualityManagementArea.aqmaName = TEST_AQMA_NAME
    result = await AirQualityManagementAreaTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
    delete mocks.airQualityManagementArea.aqmaName

    mocks.airQualityManagementArea.aqmaNitrogenDioxideLevel = TEST_NO2_LEVEL
    result = await AirQualityManagementAreaTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
    delete mocks.airQualityManagementArea.aqmaNitrogenDioxideLevel

    mocks.airQualityManagementArea.aqmaLocalAuthorityName = TEST_AUTH_NAME
    result = await AirQualityManagementAreaTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
    delete mocks.airQualityManagementArea.aqmaLocalAuthorityName

    mocks.airQualityManagementArea.aqmaName = TEST_AQMA_NAME
    mocks.airQualityManagementArea.aqmaNitrogenDioxideLevel = TEST_NO2_LEVEL
    result = await AirQualityManagementAreaTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
    delete mocks.airQualityManagementArea.aqmaName
    delete mocks.airQualityManagementArea.aqmaNitrogenDioxideLevel

    mocks.airQualityManagementArea.aqmaNitrogenDioxideLevel = TEST_NO2_LEVEL
    mocks.airQualityManagementArea.aqmaLocalAuthorityName = TEST_AUTH_NAME
    result = await AirQualityManagementAreaTask.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
    delete mocks.airQualityManagementArea.aqmaNitrogenDioxideLevel
    delete mocks.airQualityManagementArea.aqmaLocalAuthorityName
  })
})
