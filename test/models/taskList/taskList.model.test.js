'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const TaskList = require('../../../src/models/taskList/taskList.model')
const DynamicsDalService = require('../../../src/services/dynamicsDal.service')

let sandbox
const context = {authToken: 'AUTH_TOKEN'}

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(DynamicsDalService.prototype, 'search').value(() => {
    return {
      // None of the other return values are required for the tests
      defra_parametersId: {
        // The actual waste parameters are not required for the tests
      }
    }
  })
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List Model tests:', () => {
  const expectedSections = {
    'before-you-apply-section': [
      'check-permit-cost-and-time',
      'confirm-that-your-operation-meets-the-rules',
      'confirm-the-drainage-system-for-the-vehicle-storage-area',
      'set-up-save-and-return'
    ],

    'prepare-application-section': [
      'waste-recovery-plan',
      'tell-us-if-youve-discussed-this-application-with-us',
      'give-contact-details',
      'give-permit-holder-details',
      'give-site-name-and-location',
      'upload-the-site-plan',
      'upload-technical-management-qualifications',
      'tell-us-which-management-system-you-use',
      'upload-the-fire-prevention-plan',
      'confirm-confidentiality-needs',
      'invoicing-details'
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
      Code.expect(section.sectionItems.length).to.equal(expectedSectionItemIds.length)

      const actualSectionItemIds = section.sectionItems.map(sectionItem => sectionItem.id)
      Code.expect(JSON.stringify(actualSectionItemIds)).to.equal(JSON.stringify(expectedSectionItemIds))
    })
  })
})
