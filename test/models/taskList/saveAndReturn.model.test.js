'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Application = require('../../../src/models/application.model')
const SaveAndReturn = require('../../../src/models/taskList/saveAndReturn.model')

const COMPLETENESS_PARAMETER = 'defra_setupsaveandreturn_completed'

let fakeApplication

let sandbox

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    saveAndReturnEmail: 'SAVE_AND_RETURN_EMAIL'
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

lab.experiment('Task List: SaveAndReturn Model tests:', () => {
  lab.test(`completenessParameter is ${COMPLETENESS_PARAMETER}`, async () => {
    Code.expect(SaveAndReturn.completenessParameter).to.equal(COMPLETENESS_PARAMETER)
  })

  lab.test('checkComplete() method correctly returns FALSE when saveAndReturn is not set', async () => {
    fakeApplication.saveAndReturnEmail = ''
    const result = await SaveAndReturn.checkComplete()
    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns TRUE when saveAndReturn is set', async () => {
    const result = await SaveAndReturn.checkComplete()
    Code.expect(result).to.equal(true)
  })
})
