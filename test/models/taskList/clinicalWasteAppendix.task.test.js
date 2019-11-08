'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const Annotation = require('../../../src/persistence/entities/annotation.entity')
const ClinicalWasteAppendix = require('../../../src/models/taskList/clinicalWasteAppendix.task')
const StoreTreatModel = require('../../../src/models/storeTreat.model')

let sandbox
let mocks
let listAnnotationsStub

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  listAnnotationsStub = sandbox.stub(Annotation, 'listByApplicationIdAndSubject')
  sandbox.stub(StoreTreatModel, 'get').callsFake(async () => mocks.storeTreat)
  listAnnotationsStub.resolves([{}])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: ClinicalWasteAppendix Model tests:', () => {
  lab.test('checkComplete() method correctly returns FALSE when justifcation question is not answered', async () => {
    mocks.storeTreat.storeTreat = undefined
    const result = await ClinicalWasteAppendix.checkComplete(mocks.context)
    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns FALSE when justification needed and not provided', async () => {
    mocks.storeTreat.storeTreat = true
    listAnnotationsStub.withArgs({}, 'clinical waste non-standard justification').resolves([])
    const result = await ClinicalWasteAppendix.checkComplete({})
    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns FALSE when no treatment summary provided', async () => {
    mocks.storeTreat.storeTreat = false
    listAnnotationsStub.withArgs({}, 'clinical waste treatment summary').resolves([])
    const result = await ClinicalWasteAppendix.checkComplete({})
    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns FALSE when no layout plan provided', async () => {
    mocks.storeTreat.storeTreat = false
    listAnnotationsStub.withArgs({}, 'clinical waste layout plans and process flows').resolves([])
    const result = await ClinicalWasteAppendix.checkComplete({})
    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns TRUE when all uploads provided, except justification when not required', async () => {
    mocks.storeTreat.storeTreat = false
    listAnnotationsStub.withArgs({}, 'clinical waste non-standard justification').resolves([])
    const result = await ClinicalWasteAppendix.checkComplete({})
    Code.expect(result).to.equal(true)
  })

  lab.test('checkComplete() method correctly returns TRUE when all uploads provided', async () => {
    mocks.storeTreat.storeTreat = true
    const result = await ClinicalWasteAppendix.checkComplete({})
    Code.expect(result).to.equal(true)
  })
})
