'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const Annotation = require('../../../src/persistence/entities/annotation.entity')
// TODO: Replace with this stub code when the controller is changed to use application answers
//  const ApplicationAnswer = require('../../../src/persistence/entities/applicationAnswer.entity')
const DataStore = require('../../../src/models/dataStore.model')

const ManageHazardousWaste = require('../../../src/models/taskList/manageHazardousWaste.task')

let sandbox
// let applicationAnswerStub
let dataStoreStub
let listAnnotationsStub

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  listAnnotationsStub = sandbox.stub(Annotation, 'listByApplicationIdAndSubject')
  listAnnotationsStub.resolves([{}])
  // applicationAnswerStub = sandbox.stub(ApplicationAnswer, 'getByQuestionCode')
  // applicationAnswerStub.withArgs({}, 'meet-hazardous-waste-standards').resolves({ answerCode: 'yes' })
  // applicationAnswerStub.withArgs({}, 'hazardous-waste-procedures').resolves({ answerText: 'Valid procedures' })
  // applicationAnswerStub.resolves()
  dataStoreStub = sandbox.stub(DataStore, 'get')
  dataStoreStub.resolves(new DataStore({
    data: {
      'meet-hazardous-waste-standards': 'yes',
      'hazardous-waste-procedures': 'Valid procedures'
    }
  }))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: ManageHazardousWaste Model tests:', () => {
  lab.test(`checkComplete() method correctly returns FALSE when question isn't found`, async () => {
    // applicationAnswerStub.withArgs({}, 'meet-hazardous-waste-standards').resolves()
    dataStoreStub.resolves(new DataStore({ data: {} }))
    const result = await ManageHazardousWaste.checkComplete({})
    Code.expect(result).to.equal(false)
  })

  lab.test(`checkComplete() method correctly returns FALSE when question hasn't been answered`, async () => {
    // applicationAnswerStub.withArgs({}, 'meet-hazardous-waste-standards').resolves({ answerCode: undefined })
    dataStoreStub.resolves(new DataStore({ data: { 'meet-hazardous-waste-standards': undefined } }))
    const result = await ManageHazardousWaste.checkComplete({})
    Code.expect(result).to.equal(false)
  })

  lab.test(`checkComplete() method correctly returns FALSE when question hasn't been answered correctly`, async () => {
    // applicationAnswerStub.withArgs({}, 'meet-hazardous-waste-standards').resolves({ answerCode: 'invalid' })
    dataStoreStub.resolves(new DataStore({ data: { 'meet-hazardous-waste-standards': 'invalid' } }))
    const result = await ManageHazardousWaste.checkComplete({})
    Code.expect(result).to.equal(false)
  })

  lab.test(`checkComplete() method correctly returns FALSE when will meet standards but no procedures provided`, async () => {
    // applicationAnswerStub.withArgs({}, 'hazardous-waste-procedures').resolves()
    dataStoreStub.resolves(new DataStore({
      data: {
        'meet-hazardous-waste-standards': 'yes',
        'hazardous-waste-procedures': undefined
      }
    }))
    const result = await ManageHazardousWaste.checkComplete({})
    Code.expect(result).to.equal(false)
  })

  lab.test(`checkComplete() method correctly returns FALSE when will meet standards but procedures blank`, async () => {
    // applicationAnswerStub.withArgs({}, 'hazardous-waste-procedures').resolves({ answerText: '' })
    dataStoreStub.resolves(new DataStore({
      data: {
        'meet-hazardous-waste-standards': 'yes',
        'hazardous-waste-procedures': ''
      }
    }))
    const result = await ManageHazardousWaste.checkComplete({})
    Code.expect(result).to.equal(false)
  })

  lab.test(`checkComplete() method correctly returns TRUE when will meet standards and procedures provided`, async () => {
    const result = await ManageHazardousWaste.checkComplete({})
    Code.expect(result).to.equal(true)
  })

  lab.test(`checkComplete() method correctly returns FALSE when will not meet standards but no proposal provided`, async () => {
    // applicationAnswerStub.withArgs({}, 'meet-hazardous-waste-standards').resolves({ answerCode: 'no' })
    dataStoreStub.resolves(new DataStore({ data: { 'meet-hazardous-waste-standards': 'no' } }))
    listAnnotationsStub.withArgs({}, 'hazardous waste management proposal').resolves([])
    const result = await ManageHazardousWaste.checkComplete({})
    Code.expect(result).to.equal(false)
  })

  lab.test(`checkComplete() method correctly returns TRUE when will meet standards and proposal provided`, async () => {
    // applicationAnswerStub.withArgs({}, 'meet-hazardous-waste-standards').resolves({ answerCode: 'no' })
    dataStoreStub.resolves(new DataStore({ data: { 'meet-hazardous-waste-standards': 'no' } }))
    const result = await ManageHazardousWaste.checkComplete({})
    Code.expect(result).to.equal(true)
  })

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
})
