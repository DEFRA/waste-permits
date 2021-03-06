'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')

const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')
const Item = require('../../src/persistence/entities/item.entity')
const StandardRuleType = require('../../src/persistence/entities/standardRuleType.entity')
const DataStore = require('../../src/models/dataStore.model')
const TaskDeterminants = require('../../src/models/taskDeterminants.model')
const { STATIONARY_SG, MOBILE_SG } = require('../../src/dynamics').MCP_TYPES
const { STANDARD_RULES, BESPOKE } = require('../../src/constants').PermitTypes

let context
let sandbox
let mocks

let applicationAnswerSaveStub
let dataSourceSaveStub

const allAssessments = [
  { id: 'ass-1', shortName: 'MCP-EER' },
  { id: 'ass-2', shortName: 'MCP-BAT' },
  { id: 'ass-3', shortName: '1-19-2' }
]

lab.beforeEach(() => {
  mocks = new Mocks()

  context = mocks.context

  Object.assign(mocks.wasteAssessments, allAssessments.map(({ id, shortName }) => new Item({ id, shortName })))

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(ApplicationAnswer, 'getByQuestionCode').callsFake(() => mocks.applicationAnswer)
  applicationAnswerSaveStub = sandbox.stub(ApplicationAnswer.prototype, 'save').callsFake(() => undefined)
  sandbox.stub(Item, 'listWasteAssessments').callsFake(() => mocks.wasteAssessments)
  sandbox.stub(StandardRuleType, 'getCategories').value(() => [])
  sandbox.stub(DataStore, 'get').callsFake(() => mocks.dataStore)
  dataSourceSaveStub = sandbox.stub(DataStore.prototype, 'save').callsFake(() => undefined)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('TaskDeterminants Model tests:', () => {
  lab.experiment('get() method correctly retrieves the task determinant values for', () => {
    lab.test('context', async () => {
      const taskDeterminants = await TaskDeterminants.get(context)
      Code.expect(taskDeterminants.context).to.equal(context)
    })

    lab.test('allAssessments', async () => {
      const taskDeterminants = await TaskDeterminants.get(context)
      Code.expect(taskDeterminants.allAssessments).to.equal(mocks.wasteAssessments)
    })

    lab.test('mcpType', async () => {
      mocks.applicationAnswer.answerCode = STATIONARY_SG.id
      const taskDeterminants = await TaskDeterminants.get(context)
      Code.expect(taskDeterminants.mcpType).to.equal(STATIONARY_SG)
    })

    lab.test('permitType', async () => {
      const taskDeterminants = await TaskDeterminants.get(context)
      Code.expect(taskDeterminants.permitType).to.equal(STANDARD_RULES)
    })
  })

  lab.experiment('save() method correctly saves the task determinant values for', () => {
    lab.test('mcpType', async () => {
      const taskDeterminants = await TaskDeterminants.get(context)
      await taskDeterminants.save({ mcpType: MOBILE_SG.id })
      Code.expect(taskDeterminants.mcpType).to.equal(MOBILE_SG)
      Code.expect(applicationAnswerSaveStub.callCount).to.equal(1)
    })

    lab.test('permitType', async () => {
      const taskDeterminants = await TaskDeterminants.get(context)
      await taskDeterminants.save({ permitType: BESPOKE.id })
      Code.expect(taskDeterminants.permitType).to.equal(BESPOKE)
      Code.expect(dataSourceSaveStub.callCount).to.equal(1)
    })

    lab.test('wasteAssessments', async () => {
      const taskDeterminants = await TaskDeterminants.get(context)
      await taskDeterminants.save({ wasteAssessments: [allAssessments[0].shortName, allAssessments[1].shortName] })
      Code.expect(taskDeterminants.wasteAssessments).to.equal([allAssessments[0], allAssessments[1]])
    })

    lab.test('no wasteAssessments', async () => {
      const taskDeterminants = await TaskDeterminants.get(context)
      await taskDeterminants.save({ wasteAssessments: '' })
      Code.expect(taskDeterminants.wasteAssessments).to.equal([])
    })
  })
})
