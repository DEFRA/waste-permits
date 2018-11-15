'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const Application = require('../../../src/persistence/entities/application.entity')
const ApplicationReturn = require('../../../src/persistence/entities/applicationReturn.entity')
const SaveAndReturn = require('../../../src/models/taskList/saveAndReturn.task')

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(Application, 'getById').callsFake(() => mocks.application)
  sandbox.stub(ApplicationReturn, 'getByApplicationId').callsFake(() => mocks.applicationReturn)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: SaveAndReturn Model tests:', () => {
  lab.test('checkComplete() method correctly returns FALSE when saveAndReturn is not set', async () => {
    delete mocks.applicationReturn.slug
    const result = await SaveAndReturn.checkComplete()
    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns TRUE when saveAndReturn is set', async () => {
    const result = await SaveAndReturn.checkComplete()
    Code.expect(result).to.equal(true)
  })
})
