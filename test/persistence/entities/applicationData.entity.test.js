'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const ApplicationData = require('../../../src/persistence/entities/applicationData.entity')
const dynamicsDal = require('../../../src/services/dynamicsDal.service')

let fakeApplicationData
let fakeData
const applicationDataId = 'APPLICATION_DATA_ID'
let context
let sandbox

lab.beforeEach(() => {
  context = { }

  fakeData = 'FAKE_DATA'

  fakeApplicationData = new ApplicationData({
    id: applicationDataId,
    applicationId: 'APPLICATION_ID',
    data: fakeData
  })

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(dynamicsDal, 'create').value(() => applicationDataId)
  sandbox.stub(dynamicsDal, 'search').value(() => {
    // Dynamics ApplicationData objects
    return {
      defra_webdataid: fakeApplicationData.id,
      _defra_applicationid_value: fakeApplicationData.applicationId,
      defra_data: fakeApplicationData.data
    }
  })
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('ApplicationData Entity tests:', () => {
  lab.test('getById() method correctly retrieves an ApplicationData object', async () => {
    const spy = sinon.spy(dynamicsDal, 'search')
    const applicationData = await ApplicationData.getById(context, applicationDataId)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(applicationData.id).to.equal(fakeApplicationData.id)
    Code.expect(applicationData.applicationId).to.equal(fakeApplicationData.applicationId)
    Code.expect(applicationData.data).to.equal(fakeApplicationData.data)
  })

  lab.test('save() method saves a new ApplicationData object', async () => {
    const spy = sinon.spy(dynamicsDal, 'create')
    delete fakeApplicationData.id
    await fakeApplicationData.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(fakeApplicationData.id).to.equal(applicationDataId)
  })
})
