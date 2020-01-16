'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const PreApplicationModel = require('../../../src/models/preApplication.model')
const Application = require('../../../src/persistence/entities/application.entity')
const PreApplicationTask = require('../../../src/models/taskList/preApplication.task')

const PRE_APPLICATION_REFERENCE = 'EPR/AB1234CD/A001'

let sandbox
let mocks
let context

lab.beforeEach(() => {
  mocks = new Mocks()

  context = mocks.context

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(PreApplicationModel, 'get').callsFake(async () => mocks.preApplication)
  sandbox.stub(PreApplicationModel.prototype, 'save').callsFake(async () => null)
  sandbox.stub(Application, 'getById').callsFake(async () => mocks.application)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: PreApplication Model tests:', () => {
  lab.test('isComplete() method correctly returns FALSE initially', async () => {
    const result = await PreApplicationTask.isComplete(context)
    Code.expect(result).to.equal(false)
  })

  lab.test('isComplete() method correctly returns TRUE when consultees entered', async () => {
    mocks.preApplication.preApplicationReference = PRE_APPLICATION_REFERENCE
    const result = await PreApplicationTask.isComplete(context)
    Code.expect(result).to.equal(true)
  })
})
