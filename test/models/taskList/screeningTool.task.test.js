'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const Annotation = require('../../../src/persistence/entities/annotation.entity')
const ScreeningTool = require('../../../src/models/taskList/screeningTool.task')

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(Annotation, 'listByApplicationIdAndSubject').value(() => [{}])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: ScreeningTool Model tests:', () => {
  lab.test('checkComplete() method correctly returns FALSE when annotations don\'t exist', async () => {
    Annotation.listByApplicationIdAndSubject = () => []
    const result = await ScreeningTool.checkComplete(mocks.context)
    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns TRUE when annotations exist', async () => {
    const result = await ScreeningTool.checkComplete(mocks.context)
    Code.expect(result).to.equal(true)
  })
})
