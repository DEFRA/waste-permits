'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const Annotation = require('../../../src/persistence/entities/annotation.entity')
const ManageHazardousWaste = require('../../../src/models/taskList/manageHazardousWaste.task')

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

lab.experiment('Task List: ManageHazardousWaste Model tests:', () => {
  lab.test(`checkComplete() method correctly returns FALSE when no summary provided`, async () => {
    listAnnotationsStub.withArgs({}, 'hazardous waste treatment summary').resolves([])
    const result = await ManageHazardousWaste.checkComplete({})
    Code.expect(result).to.equal(false)
  })

  lab.test(`checkComplete() method correctly returns FALSE when no plans provided`, async () => {
    listAnnotationsStub.withArgs({}, 'hazardous waste layout plans and process flows').resolves([])
    const result = await ManageHazardousWaste.checkComplete({})
    Code.expect(result).to.equal(false)
  })

  lab.test(`checkComplete() method correctly returns TRUE when summary and plans provided`, async () => {
    const result = await ManageHazardousWaste.checkComplete({})
    Code.expect(result).to.equal(true)
  })
})
