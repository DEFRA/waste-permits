'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const Application = require('../../../src/persistence/entities/application.entity')
const Confidentiality = require('../../../src/models/taskList/confidentiality.task')

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(Application, 'getById').callsFake(() => mocks.application)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: Confidentiality Model tests:', () => {
  lab.test('checkComplete() method correctly returns FALSE when confidentiality is not set', async () => {
    delete mocks.application.confidentiality
    const result = await Confidentiality.checkComplete()
    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns TRUE when confidentiality is set', async () => {
    const result = await Confidentiality.checkComplete()
    Code.expect(result).to.equal(true)
  })
})
