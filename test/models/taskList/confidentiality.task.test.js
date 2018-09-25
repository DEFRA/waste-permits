'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Application = require('../../../src/persistence/entities/application.entity')
const Confidentiality = require('../../../src/models/taskList/confidentiality.task')

const COMPLETENESS_PARAMETER = 'defra_cnfconfidentialityreq_completed'

let fakeApplication

let sandbox

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    confidentiality: false
  }

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(Application, 'getById').value(() => fakeApplication)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: Confidentiality Model tests:', () => {
  lab.test(`completenessParameter is ${COMPLETENESS_PARAMETER}`, async () => {
    Code.expect(Confidentiality.completenessParameter).to.equal(COMPLETENESS_PARAMETER)
  })

  lab.test('checkComplete() method correctly returns FALSE when confidentiality is not set', async () => {
    delete fakeApplication.confidentiality
    const result = await Confidentiality.checkComplete()
    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns TRUE when confidentiality is set', async () => {
    const result = await Confidentiality.checkComplete()
    Code.expect(result).to.equal(true)
  })
})
