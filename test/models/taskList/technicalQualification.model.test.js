'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Annotation = require('../../../src/models/annotation.model')
const TechnicalQualification = require('../../../src/models/taskList/technicalQualification.model')

const COMPLETENESS_PARAMETER = 'defra_techcompetenceevreq_completed'

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(Annotation, 'listByApplicationIdAndSubject').value(() => [{}])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: TechnicalQualification Model tests:', () => {
  lab.test(`completenessParameter is ${COMPLETENESS_PARAMETER}`, async () => {
    Code.expect(TechnicalQualification.completenessParameter).to.equal(COMPLETENESS_PARAMETER)
  })

  lab.test(`checkComplete() method correctly returns FALSE when annotations don't exist`, async () => {
    Annotation.listByApplicationIdAndSubject = () => []
    const result = await TechnicalQualification.checkComplete()
    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns TRUE when annotations exist', async () => {
    const result = await TechnicalQualification.checkComplete()
    Code.expect(result).to.equal(true)
  })
})
