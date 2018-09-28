'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const ApplicationLine = require('../../../src/models/applicationLine.model')
const TaskList = require('../../../src/models/taskList/taskList.model')
const DynamicsDalService = require('../../../src/services/dynamicsDal.service')

let fakeApplicationLine
let fakeCompletedId
let fakeRulesId
let fakeParametersId
let sandbox

const context = { authToken: 'AUTH_TOKEN' }
const applicationLineId = 'APPLICATION_LINE_ID'

lab.beforeEach(() => {
  fakeRulesId = 'defra_confirmreadrules'
  fakeCompletedId = 'defra_confirmreadrules_completed'
  fakeParametersId = {
    [fakeRulesId]: true,
    [fakeCompletedId]: true,
    defra_cnfconfidentialityreq: true,
    defra_cnfconfidentialityreq_completed: true,
    defra_contactdetailsrequired: true,
    defra_contactdetailsrequired_completed: true,
    defra_showcostandtime: true,
    defra_showcostandtime_completed: true
  }
  fakeApplicationLine = new ApplicationLine({
    applicationId: 'APPLICATION_ID',
    standardRuleId: 'STANDARD_RULE_ID',
    parametersId: fakeParametersId
  })

  const searchResult = {
    _defra_standardruleid_value: fakeApplicationLine.standardRuleId,
    defra_parametersId: fakeApplicationLine.parametersId,
    _defra_applicationid_value: fakeApplicationLine.applicationId
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(DynamicsDalService.prototype, 'create').value(() => applicationLineId)
  sandbox.stub(DynamicsDalService.prototype, 'search').value(() => searchResult)
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
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const taskList = await TaskList.getByApplicationLineId(context)
    Code.expect(taskList).to.not.be.null()
    Code.expect(spy.callCount).to.equal(1)
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

  lab.test('getCompleted() method correctly retrieves the completed flag from the ApplicationLine object for the specified parameter', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const completed = await TaskList.getCompleted(context, applicationLineId, fakeCompletedId)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(completed).to.equal(true)
  })

  lab.test('getValidRuleSetIds() method correctly retrieves the completed flag from the ApplicationLine object for the specified parameter', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const ruleSetIds = await TaskList.getValidRuleSetIds(context, applicationLineId)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(ruleSetIds).to.include(Object.keys(fakeParametersId))
    Code.expect(ruleSetIds.length).to.equal(Object.keys(fakeParametersId).length)
  })

  lab.test('getTaskListModels() method correctly retrieves the list of models that are required', async () => {
    const requiredModels = ['completeness', 'costTime']
    const availableTaskListModels = await TaskList.getTaskListModels(requiredModels)
    Code.expect(availableTaskListModels.length).to.equal(requiredModels.length)
  })

  lab.test('isComplete() method correctly checks for completed tasks', async () => {
    const stub = sinon.stub(TaskList, 'getTaskListModels').value(() => [])
    const complete = await TaskList.isComplete(context, applicationLineId, applicationLineId)
    stub.restore()
    Code.expect(complete).to.be.true()
  })
})
