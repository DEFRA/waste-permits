'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const Annotation = require('../../../src/persistence/entities/annotation.entity')
const ClinicalWasteAppendix = require('../../../src/models/taskList/clinicalWasteAppendix.task')

let sandbox
let listAnnotationsStub

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  listAnnotationsStub = sandbox.stub(Annotation, 'listByApplicationIdAndSubject')
  listAnnotationsStub.resolves([{}])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: ClinicalWasteAppendix Model tests:', () => {
  lab.test('checkComplete() method correctly returns FALSE when no justification provided', async () => {
    listAnnotationsStub.withArgs({}, 'clinical waste non-standard justification').resolves([])
    const result = await ClinicalWasteAppendix.checkComplete({})
    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns FALSE when no treatment summary provided', async () => {
    listAnnotationsStub.withArgs({}, 'clinical waste treatment summary').resolves([])
    const result = await ClinicalWasteAppendix.checkComplete({})
    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns FALSE when no layout plan provided', async () => {
    listAnnotationsStub.withArgs({}, 'clinical waste layout plans and process flows').resolves([])
    const result = await ClinicalWasteAppendix.checkComplete({})
    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns TRUE when all uploads provided', async () => {
    const result = await ClinicalWasteAppendix.checkComplete({})
    Code.expect(result).to.equal(true)
  })
})
