'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const StandardRulesTaskList = require('../../../src/models/taskList/standardRules.taskList')
const RuleSet = require('../../../src/models/ruleSet.model')
const DataStore = require('../../../src/models/dataStore.model')

const validRuleSetIds = []

const GENERIC_RULESET = 'GENERIC_RULESET'
const GENERIC_TASK = { ruleSetId: GENERIC_RULESET, route: true }
const { PRE_APPLICATION_REFERENCE } = require('../../../src/tasks').tasks

let context
let sandbox
let mocks
let TestTaskList

lab.beforeEach(() => {
  mocks = new Mocks()

  context = mocks.context

  TestTaskList = new StandardRulesTaskList(context)

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(RuleSet, 'getValidRuleSetIds').value(async () => validRuleSetIds)
  sandbox.stub(DataStore, 'get').value(() => ({ data: { receivedPreApplicationAdvice: undefined } }))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()

  // Clear validRuleSetIds array
  validRuleSetIds.length = 0
})

lab.experiment('Standard Rules Task List Model tests:', () => {
  lab.experiment('Rulesets', () => {
    lab.test('isAvailable() returns TRUE when the task rule set is present', async () => {
      validRuleSetIds.push(GENERIC_TASK.ruleSetId)

      const available = await TestTaskList.isAvailable(GENERIC_TASK)

      Code.expect(available).to.be.true()
    })

    lab.test('isAvailable() returns FALSE when the task rule set is not present', async () => {
      const available = await TestTaskList.isAvailable(GENERIC_TASK)

      Code.expect(available).to.be.false()
    })
  })

  lab.experiment('Rulesets', () => {
    lab.test('isAvailable() returns TRUE when pre-application advice was received', async () => {
      sandbox.stub(DataStore, 'get').value(() => ({ data: { receivedPreApplicationAdvice: true } }))

      const available = await TestTaskList.isAvailable(PRE_APPLICATION_REFERENCE)

      Code.expect(available).to.be.true()
    })

    lab.test('isAvailable() returns FALSE when pre-application advice was not received', async () => {
      sandbox.stub(DataStore, 'get').value(() => ({ data: { receivedPreApplicationAdvice: false } }))

      const available = await TestTaskList.isAvailable(PRE_APPLICATION_REFERENCE)

      Code.expect(available).to.be.false()
    })
  })
})
