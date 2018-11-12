'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const Application = require('../../../src/persistence/entities/application.entity')
const DataStore = require('../../../src/models/dataStore.model')
const RuleSet = require('../../../src/models/ruleSet.model')
const BaseTask = require('../../../src/models/taskList/base.task')
const TaskList = require('../../../src/models/taskList/taskList')

let validRuleSetIds
let context
let applicationLineId
let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  context = { authToken: 'AUTH_TOKEN' }
  applicationLineId = 'APPLICATION_LINE_ID'

  validRuleSetIds = [
    'defra_cnfconfidentialityreq',
    'defra_confirmreadrules',
    'defra_contactdetailsrequired',
    'defra_showcostandtime'
  ]

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application, 'getById').value(() => mocks.application)
  sandbox.stub(DataStore, 'get').value(() => mocks.dataStore)
  sandbox.stub(RuleSet, 'getValidRuleSetIds').value(() => validRuleSetIds)
  sandbox.stub(BaseTask, 'isComplete').value(() => false)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List Model tests:', () => {
  const expectedSections = {
    'before-you-apply-section': [
      'check-permit-cost-and-time',
      'confirm-that-your-operation-meets-the-rules'
    ],

    'prepare-application-section': [
      'give-contact-details',
      'confirm-confidentiality-needs'
    ],

    'send-and-pay-section': [
      'submit-pay'
    ]
  }

  lab.test('getByApplicationLineId() method returns a TaskList object', async () => {
    const taskList = await TaskList.getByApplicationLineId(context)
    Code.expect(taskList).to.not.be.null()
  })

  lab.test('Task List returned by getByApplicationLineId() method has the correct number of sections', async () => {
    // Get the Task List
    const taskList = await TaskList.getByApplicationLineId(context)

    // Check we have the correct sections
    Code.expect(Array.isArray(taskList.sections)).to.be.true()
    Code.expect(taskList.sections.map(({ id }) => id)).to.include(Object.keys(expectedSections))
    Code.expect(taskList.sections.length).to.equal(Object.keys(expectedSections).length)
  })

  Object.keys(expectedSections).forEach((sectionId, index) => {
    lab.test(`Task List returned by getByApplicationLineId() contains the ${sectionId} section`, async () => {
      const expectedSectionItemIds = expectedSections[sectionId]
      // Get the Task List
      const taskList = await TaskList.getByApplicationLineId(context)
      const section = taskList.sections[index]

      // Check we have the correct section IDs in the section
      Code.expect(Array.isArray(section.sectionItems)).to.be.true()
      Code.expect(section.sectionItems.map(({ id }) => id)).to.include(expectedSectionItemIds)
      Code.expect(section.sectionItems.length).to.equal(expectedSectionItemIds.length)

      const actualSectionItemIds = section.sectionItems.map(sectionItem => sectionItem.id)
      Code.expect(JSON.stringify(actualSectionItemIds)).to.equal(JSON.stringify(expectedSectionItemIds))
    })
  })

  lab.test('isComplete() method correctly checks for incomplete tasks', async () => {
    const complete = await TaskList.isComplete(context, applicationLineId, applicationLineId)
    Code.expect(complete).to.be.false()
  })

  lab.test('isComplete() method correctly checks for complete tasks', async () => {
    sinon.stub(BaseTask, 'isComplete').value(() => true)
    const complete = await TaskList.isComplete(context, applicationLineId, applicationLineId)
    Code.expect(complete).to.be.true()
  })
})
