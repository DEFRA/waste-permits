'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const config = require('../../../src/config/config')
const featureConfig = require('../../../src/config/featureConfig')
const Application = require('../../../src/persistence/entities/application.entity')
const ApplicationReturn = require('../../../src/persistence/entities/applicationReturn.entity')
const TaskDeterminants = require('../../../src/models/taskDeterminants.model')
const RuleSet = require('../../../src/models/ruleSet.model')
const BaseTask = require('../../../src/models/taskList/base.task')
const TaskList = require('../../../src/models/taskList/base.taskList')

class TestTaskList extends TaskList {
  isAvailable () {
    return true
  }

  get taskListTemplate () {
    return [
      {
        id: 'before-you-apply-section',
        label: 'Before you apply',
        tasks: [{
          id: 'check-permit-cost-and-time',
          label: 'Check costs and processing time',
          completedLabelId: 'cost-and-time-completed',
          ruleSetId: 'defra_showcostandtime',
          route: '/route',
          taskListModel: 'costTime'
        }, {
          id: 'confirm-that-your-operation-meets-the-rules',
          label: 'Confirm you can meet the rules',
          completedLabelId: 'operation-rules-completed',
          ruleSetId: 'defra_confirmreadrules',
          route: '/route',
          taskListModel: 'confirmRules'
        }]
      },
      {
        id: 'prepare-application-section',
        label: 'Prepare application',
        tasks: [{
          id: 'give-contact-details',
          label: 'Give contact details',
          completedLabelId: 'contact-details-completed',
          ruleSetId: 'defra_contactdetailsrequired',
          route: '/route',
          taskListModel: 'contactDetails'
        }, {
          id: 'confirm-confidentiality-needs',
          label: 'Confirm confidentiality needs',
          completedLabelId: 'confidentiality-completed',
          ruleSetId: 'defra_cnfconfidentialityreq',
          route: '/route',
          taskListModel: 'confidentiality'
        }]
      },
      {
        id: 'send-and-pay-section',
        label: 'Apply',
        tasks: [{
          id: 'submit-pay',
          label: 'Send application and pay',
          completedLabelId: 'submit-and-pay',
          required: true
        }]
      }
    ]
  }
}

let validRuleSetIds
let context
let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  context = mocks.context

  validRuleSetIds = [
    'defra_cnfconfidentialityreq',
    'defra_confirmreadrules',
    'defra_contactdetailsrequired',
    'defra_showcostandtime'
  ]

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(config, 'bypassCompletenessCheck').value(false)
  sandbox.stub(featureConfig, 'hasBespokeFeature').value(true)
  sandbox.stub(Application, 'getById').value(async () => mocks.application)
  sandbox.stub(ApplicationReturn, 'getByApplicationId').value(async () => mocks.applicationReturn)
  sandbox.stub(TaskDeterminants, 'get').value(async () => mocks.taskDeterminants)
  sandbox.stub(RuleSet, 'getValidRuleSetIds').value(() => validRuleSetIds)
  sandbox.stub(BaseTask, 'isComplete').value(async () => false)
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

  lab.test('buildTaskList() method returns a TaskList object', async () => {
    const taskList = await TestTaskList.buildTaskList(context)
    Code.expect(taskList).to.not.be.null()
  })

  lab.test('Task List returned by buildTaskList() method has the correct number of sections', async () => {
    // Get the Task List
    const taskList = await TestTaskList.buildTaskList(context)

    // Check we have the correct sections
    Code.expect(Array.isArray(taskList.sections)).to.be.true()
    Code.expect(taskList.sections.map(({ id }) => id)).to.include(Object.keys(expectedSections))
    Code.expect(taskList.sections.length).to.equal(Object.keys(expectedSections).length)
  })

  Object.keys(expectedSections).forEach((sectionId, index) => {
    lab.test(`Task List returned by buildTaskList() contains the ${sectionId} section`, async () => {
      const expectedSectionItemIds = expectedSections[sectionId]
      // Get the Task List
      const taskList = await TestTaskList.buildTaskList(context)
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
    sinon.stub(BaseTask, 'isComplete').value(async () => false)
    const complete = await TestTaskList.isComplete(context)
    Code.expect(complete).to.be.false()
  })

  lab.test('isComplete() method correctly checks for complete tasks', async () => {
    sinon.stub(BaseTask, 'isComplete').value(async () => true)
    const complete = await TestTaskList.isComplete(context)
    Code.expect(complete).to.be.true()
  })
})
